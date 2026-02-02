# VibeFlow 改进方案：基于 Git 的真实变更检测 + 严苛测试

## 📊 日志分析结果

### 当前 Agent 输出情况：
1. **task_1.log**: 纯文字说明，无 `<<<<FILE:` 标记 ✓ 正确报告 NO_CHANGES
2. **task_1_1.log**: 纯文字说明，无 `<<<<FILE:` 标记 ✓ 正确报告 NO_CHANGES  
3. **task_1_2.log**: API 429 错误（达到使用上限）❌
4. **task_2.log**: Python 代码在 markdown 块中，无 `<<<<FILE:` 标记 ✗ **误报 NO_CHANGES**

### 核心问题确认：
✅ **你的判断完全正确**：
- Claude 输出了代码（task_2），但没有使用正确的格式
- 当前检测机制（基于 `<<<<FILE:` 标记）**不可靠**
- 应该以 **Git 实际变更** 为准

---

## 🎯 改进方案：Git-Based Change Detection + Verifier & Healer Loop

### 方案架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Pipeline (Enhanced)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. [Pre-Snapshot] Git状态快照                               │
│     ├─ git diff --name-status > pre_snapshot.txt            │
│     └─ git rev-parse HEAD > pre_commit.txt                  │
│                                                               │
│  2. [Builder Phase] Claude 生成代码                          │
│     ├─ 保持现有的 <<<<FILE:>>>> 格式支持                    │
│     └─ 同时支持 Claude 直接操作文件（通过 --dangerously）   │
│                                                               │
│  3. [Post-Snapshot] Git变更检测                              │
│     ├─ git diff --name-status > post_snapshot.txt           │
│     ├─ 对比 pre/post，生成 changed_files.txt                │
│     └─ 如果有变更 → 进入 Verifier Loop                      │
│        如果无变更 → 标记为 Analysis Task，跳过测试          │
│                                                               │
│  4. [Verifier & Healer Loop] 严苛测试与修复                 │
│     ├─ Phase A: 静态检查                                     │
│     │   ├─ Linter (eslint/pylint/etc)                       │
│     │   ├─ Type Check (tsc/mypy/etc)                        │
│     │   └─ Build Test (npm build/pio run/etc)               │
│     │                                                         │
│     ├─ Phase B: 单元测试                                     │
│     │   └─ Domain-specific test command                     │
│     │                                                         │
│     ├─ Phase C: 代码审查 (New!)                             │
│     │   ├─ Claude as Reviewer (Linus风格)                   │
│     │   ├─ 检查：逻辑错误、边界条件、资源泄漏               │
│     │   └─ 输出：review_report.md                           │
│     │                                                         │
│     └─ Phase D: 自愈循环                                     │
│         ├─ 如果任何阶段失败 → Healer Agent                   │
│         ├─ Healer 分析错误 + Git diff                        │
│         ├─ 生成修复 → 重新进入 Verifier Loop                │
│         └─ 最多重试 MAX_RETRIES 次                           │
│                                                               │
│  5. [Final Commit] 成功后自动提交                            │
│     └─ git commit -m "Agent: $task_name - $summary"         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 具体实现

### 1. Git-Based Change Detection

```bash
# 在 run_agent_pipeline 函数中添加

function run_agent_pipeline() {
    local id="$1"
    local name="$2"
    local desc="$3"
    local domain=$(detect_domain)
    local log_file="$LOG_DIR/${id}.log"
    
    echo -e "${CYAN}🚀 [Agent] $name ($domain)${NC}"

    (
        # ========== NEW: Pre-Snapshot ==========
        local pre_snapshot="$LOG_DIR/${id}_pre.snapshot"
        local post_snapshot="$LOG_DIR/${id}_post.snapshot"
        local changed_files="$LOG_DIR/${id}_changes.txt"
        
        # 记录初始状态
        git diff --name-status > "$pre_snapshot"
        git ls-files --others --exclude-standard >> "$pre_snapshot"  # 未跟踪文件
        
        # ========== Builder Phase (保持不变) ==========
        local write_instruction="..."
        local build_prompt="..."
        
        echo ">>> Building..." > "$log_file"
        
        # Claude 执行（保持现有逻辑）
        local api_retries=0
        local api_success=false
        while [[ $api_retries -lt 3 ]]; do
            if claude --dangerously-skip-permissions -p "$build_prompt" >> "$log_file" 2>&1; then
                api_success=true
                break
            else
                echo "⚠️ API Error (Attempt $((api_retries+1))/3)" >> "$log_file"
                sleep 2
                ((api_retries++))
            fi
        done

        if [[ "$api_success" == "false" ]]; then
             echo "❌ CRITICAL API FAILURE" >> "$log_file"
             exit 1
        fi

        # 尝试应用 FILE 标记（向后兼容）
        python3 -c "$PYTHON_PATCHER" "$log_file" >> "$log_file" 2>&1
        
        # ========== NEW: Post-Snapshot & Change Detection ==========
        git diff --name-status > "$post_snapshot"
        git ls-files --others --exclude-standard >> "$post_snapshot"
        
        # 对比变更
        comm -3 <(sort "$pre_snapshot") <(sort "$post_snapshot") > "$changed_files"
        
        # 检查是否有实际变更
        if [[ ! -s "$changed_files" ]]; then
            echo "ℹ️ No file changes detected (Git-based). Task classified as Analysis." >> "$log_file"
            exit 0
        fi
        
        echo "📝 Detected changes:" >> "$log_file"
        cat "$changed_files" >> "$log_file"
        
        # ========== Enhanced Verifier & Healer Loop ==========
        local retries=0
        local success=false
        
        while [[ $retries -lt $MAX_RETRIES ]]; do
            echo ">>> Verification Cycle $((retries+1))..." >> "$log_file"
            
            # Phase A: 静态检查
            if ! run_static_checks "$domain" "$changed_files" >> "$log_file" 2>&1; then
                echo "⚠️ Static checks failed. Healing..." >> "$log_file"
                run_healer "$log_file" "$changed_files" "static_check_failure"
                ((retries++))
                continue
            fi
            
            # Phase B: 单元测试
            local test_cmd=$(get_test_command "$domain")
            if ! eval "$test_cmd" >> "$log_file" 2>&1; then
                echo "⚠️ Unit tests failed. Healing..." >> "$log_file"
                run_healer "$log_file" "$changed_files" "test_failure"
                ((retries++))
                continue
            fi
            
            # Phase C: 代码审查
            if ! run_code_review "$name" "$changed_files" >> "$log_file" 2>&1; then
                echo "⚠️ Code review found issues. Healing..." >> "$log_file"
                run_healer "$log_file" "$changed_files" "review_failure"
                ((retries++))
                continue
            fi
            
            # 所有检查通过
            echo "✅ All verifications passed" >> "$log_file"
            success=true
            break
        done

        if [[ "$success" == "false" ]]; then
            echo "❌ Module Failed after $MAX_RETRIES healing attempts." >> "$log_file"
            exit 1
        fi
        
        # ========== NEW: Auto Commit ==========
        if [[ "$AUTO_COMMIT" == "true" ]]; then
            git add $(cat "$changed_files" | awk '{print $2}')
            git commit -m "Agent: $name - Auto-commit after verification" >> "$log_file" 2>&1
        fi

    ) & 
    PIDS+=($!)
}
```

### 2. 静态检查函数

```bash
function run_static_checks() {
    local domain="$1"
    local changed_files="$2"
    
    echo ">>> Running static checks..."
    
    case "$domain" in
        WEB)
            # ESLint
            if command -v eslint &> /dev/null; then
                while IFS= read -r line; do
                    file=$(echo "$line" | awk '{print $2}')
                    if [[ "$file" =~ \.(ts|tsx|js|jsx)$ ]]; then
                        eslint "$file" || return 1
                    fi
                done < "$changed_files"
            fi
            
            # TypeScript
            if [[ -f "tsconfig.json" ]]; then
                tsc --noEmit || return 1
            fi
            ;;
            
        PYTHON_GENERIC|AI_ROBOT)
            # Pylint/Flake8
            if command -v pylint &> /dev/null; then
                while IFS= read -r line; do
                    file=$(echo "$line" | awk '{print $2}')
                    if [[ "$file" =~ \.py$ ]]; then
                        pylint "$file" || return 1
                    fi
                done < "$changed_files"
            fi
            
            # MyPy
            if command -v mypy &> /dev/null; then
                mypy $(grep '\.py$' "$changed_files" | awk '{print $2}') || return 1
            fi
            ;;
            
        HARDWARE)
            # PlatformIO check
            if [[ -f "platformio.ini" ]]; then
                pio check || return 1
            fi
            ;;
    esac
    
    return 0
}
```

### 3. 代码审查函数

```bash
function run_code_review() {
    local task_name="$1"
    local changed_files="$2"
    local review_file="$LOG_DIR/review_${task_name}.md"
    
    echo ">>> Running code review (Claude as Linus)..."
    
    # 生成 diff
    local diff_content=$(git diff --cached $(cat "$changed_files" | awk '{print $2}'))
    
    local review_prompt="
    [ROLE] You are Linus Torvalds reviewing a code submission.
    
    [TASK] $task_name
    
    [CHANGES]
    $diff_content
    
    [REVIEW CRITERIA]
    1. **逻辑正确性**: 是否有明显的逻辑错误？
    2. **边界条件**: 是否处理了所有边界情况（空值、零、负数等）？
    3. **资源管理**: 是否有内存泄漏、文件未关闭等问题？
    4. **错误处理**: 异常处理是否完善？
    5. **代码品味**: 是否遵循\"好品味\"原则（简洁、清晰、无特殊情况）？
    
    [OUTPUT FORMAT]
    If APPROVED:
    LGTM: [brief reason]
    
    If REJECTED:
    REJECT: [critical issues]
    SUGGESTIONS:
    - [具体修改建议]
    "
    
    claude --dangerously-skip-permissions -p "$review_prompt" > "$review_file"
    
    # 检查是否通过
    if grep -q "^LGTM:" "$review_file"; then
        echo "✅ Code review passed"
        return 0
    else
        echo "❌ Code review rejected"
        cat "$review_file"
        return 1
    fi
}
```

### 4. 增强的 Healer

```bash
function run_healer() {
    local log_file="$1"
    local changed_files="$2"
    local failure_type="$3"
    
    echo ">>> Healer activated (Failure: $failure_type)..." >> "$log_file"
    
    # 提取错误上下文
    local error_log=$(tail -n 50 "$log_file")
    local diff_content=$(git diff $(cat "$changed_files" | awk '{print $2}'))
    
    local heal_prompt="
    [ROLE] Code Healer
    
    [FAILURE TYPE] $failure_type
    
    [ERROR LOG]
    $error_log
    
    [CURRENT CHANGES]
    $diff_content
    
    [INSTRUCTION]
    Fix the issues. Output code using the <<<<FILE:path>>>> format.
    Focus on the specific failure type.
    
    CRITICAL OUTPUT FORMAT:
    <<<<FILE: path/to/file.ext>>>>
    [Fixed content]
    <<<<END>>>>
    "
    
    claude --dangerously-skip-permissions -p "$heal_prompt" >> "$log_file" 2>&1
    
    # 应用修复
    python3 -c "$PYTHON_PATCHER" "$log_file" >> "$log_file" 2>&1
    
    # 检查是否有修复
    if grep -q "NO_CHANGES_FOUND" "$log_file"; then
        echo "ℹ️ Healer could not generate a fix." >> "$log_file"
        return 1
    fi
    
    return 0
}
```

---

## 📈 方案优势

### 1. **真实性保证**
- ✅ 以 Git 为准，不依赖 LLM 输出格式
- ✅ 检测所有文件变更（包括 Claude 直接操作的文件）
- ✅ 区分 Analysis Task vs Implementation Task

### 2. **严苛测试**
- ✅ 多阶段验证（静态 → 单元 → 审查）
- ✅ 每个阶段都有明确的通过/失败标准
- ✅ 失败后自动进入 Healer Loop

### 3. **智能修复**
- ✅ Healer 获得完整上下文（错误类型 + Git diff）
- ✅ 针对性修复（静态检查失败 vs 测试失败）
- ✅ 避免无限循环（最多 MAX_RETRIES 次）

### 4. **可追溯性**
- ✅ 每个 Agent 的变更都有 Git commit
- ✅ 详细的 review 报告
- ✅ 完整的 healing 历史

---

## 🚀 实施步骤

### Phase 1: Git-Based Detection (核心)
1. 修改 `run_agent_pipeline` 添加 pre/post snapshot
2. 实现 `changed_files` 检测逻辑
3. 测试：确保能正确检测变更

### Phase 2: Static Checks
1. 实现 `run_static_checks` 函数
2. 为每个 domain 配置 linter
3. 测试：故意引入 lint 错误

### Phase 3: Code Review
1. 实现 `run_code_review` 函数
2. 优化 review prompt
3. 测试：提交有问题的代码

### Phase 4: Enhanced Healer
1. 修改 Healer 接收 failure_type
2. 添加 Git diff 到 heal_prompt
3. 测试：验证修复效果

### Phase 5: Integration
1. 整合所有阶段
2. 端到端测试
3. 性能优化

---

## 🎯 预期效果

**Before:**
```
Agent 输出 → 检查 FILE 标记 → NO_CHANGES_FOUND → 跳过测试
（实际可能有代码变更，但格式错误导致漏检）
```

**After:**
```
Agent 输出 → Git diff 检测 → 发现变更 → 
静态检查 → 单元测试 → 代码审查 → 
失败 → Healer → 重新验证 → 
成功 → Auto commit
```

**关键改进:**
- ✅ 100% 检测到代码变更（基于 Git）
- ✅ 多层次质量保证
- ✅ 自动修复能力
- ✅ 完整的审计追踪

---

## 💡 额外建议

### 1. 配置化测试命令
```bash
# .vibe_config.yaml
domains:
  WEB:
    static_checks:
      - eslint src/**/*.{ts,tsx}
      - tsc --noEmit
    unit_tests:
      - npm test
    build_test:
      - npm run build
      
  PYTHON_GENERIC:
    static_checks:
      - pylint src/
      - mypy src/
    unit_tests:
      - pytest tests/
```

### 2. 并行化静态检查
```bash
# 使用 GNU parallel 加速
cat "$changed_files" | parallel -j 4 "eslint {}"
```

### 3. Review 缓存
```bash
# 相同的 diff 不重复 review
diff_hash=$(git diff | sha256sum)
if [[ -f "$LOG_DIR/review_cache_$diff_hash" ]]; then
    echo "Using cached review"
fi
```

---

## 🤔 潜在挑战

1. **性能**: 每个 Agent 都要做完整验证，可能变慢
   - **解决**: 并行化静态检查，缓存 review 结果

2. **误报**: Git 可能检测到无关文件（如 log 文件）
   - **解决**: 过滤 `.gitignore` 中的文件

3. **Healer 无限循环**: 如果 Healer 一直失败
   - **解决**: 严格的 MAX_RETRIES，记录失败原因

---

## ✅ 总结

你的建议非常正确：

1. ✅ **以 Git 为准** - 唯一可靠的变更检测方式
2. ✅ **固定测试不够** - 需要针对每个 Agent 的具体变更进行测试
3. ✅ **交给 Verifier & Healer Loop** - 完美的架构位置

这个方案将 VibeFlow 从"希望 LLM 遵循格式"升级到"无论 LLM 怎么输出都能正确检测和验证"，大大提高了系统的健壮性。
