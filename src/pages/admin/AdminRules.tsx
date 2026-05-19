import type { FC } from 'react';
import { useState } from 'react';
import {
  Plus,
  Pencil,
  Eye,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { agentRules } from '@/data/mockData';
import type { AgentRule } from '@/data/mockData';

type RuleCategory = '全部' | '拦截规则' | '警示规则' | '分流规则' | '消防联动';

const categories: RuleCategory[] = ['全部', '拦截规则', '警示规则', '分流规则', '消防联动'];

const getRuleCategory = (rule: AgentRule): string => {
  if (rule.condition.includes('多模态') || rule.condition.includes('消防')) return '消防联动';
  if (rule.level === 'L1') return '拦截规则';
  if (rule.level === 'L2') return '警示规则';
  return '分流规则';
};

export const AdminRules: FC = () => {
  const [activeCategory, setActiveCategory] = useState<RuleCategory>('全部');
  const [editingRule, setEditingRule] = useState<AgentRule | null>(null);
  const [ruleEnabled, setRuleEnabled] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(agentRules.map((r) => [r.id, true]))
  );
  const [whatIfResult, setWhatIfResult] = useState<string>('');

  const filteredRules = agentRules.filter((rule) => {
    if (activeCategory === '全部') return true;
    return getRuleCategory(rule) === activeCategory;
  });

  const toggleRule = (id: number) => {
    setRuleEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const runWhatIf = (rule: AgentRule) => {
    setWhatIfResult(
      `规则 "${rule.condition}" 的What-If影响预览：若${ruleEnabled[rule.id] ? '禁用' : '启用'}此规则，` +
      `预计${ruleEnabled[rule.id] ? '减少' : '增加'}拦截事件 ${Math.floor(Math.random() * 5 + 1)} 起/周，` +
      `影响供应商 ${Math.floor(Math.random() * 3 + 1)} 家。`
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        title="规则配置"
        breadcrumbs={[{ label: '配置' }, { label: '规则配置' }]}
        actions={
          <button className="flex items-center gap-1.5 rounded-md bg-info px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-info/80">
            <Plus className="h-3.5 w-3.5" />
            新建规则
          </button>
        }
      />

      {/* Category Tabs */}
      <div className="mb-6 flex border-b border-border-light">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeCategory === cat
                ? 'border-info text-info'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <div className="rounded-lg bg-gray-100 p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted w-12">ID</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">规则名称</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">触发条件</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">动作</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">优先级</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">状态</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule) => (
              <tr
                key={rule.id}
                className="border-b border-border-light/30 transition-colors hover:bg-primary"
              >
                <td className="px-3 py-3 font-data text-xs text-text-muted">R-{String(rule.id).padStart(2, '0')}</td>
                <td className="px-3 py-3 text-xs font-medium text-text-primary">
                  规则{rule.id}
                </td>
                <td className="px-3 py-3 text-xs text-text-secondary max-w-[200px] truncate">
                  {rule.condition}
                </td>
                <td className="px-3 py-3 text-xs text-text-secondary">
                  {rule.actions.join('、')}
                </td>
                <td className="px-3 py-3">
                  {rule.level ? (
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        rule.level === 'L1'
                          ? 'bg-l1-badge text-white'
                          : 'bg-l2-badge text-white'
                      }`}
                    >
                      {rule.level}
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <button onClick={() => toggleRule(rule.id)}>
                    {ruleEnabled[rule.id] ? (
                      <ToggleRight className="h-5 w-5 text-success" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-text-muted" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-info"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => runWhatIf(rule)}
                      className="rounded p-1 text-text-muted transition-colors hover:bg-primary hover:text-warning"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Drawer */}
      {editingRule && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingRule(null)} />
          <div className="relative w-[480px] bg-[#F1F5F9] p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">编辑规则</h3>
              <button
                onClick={() => setEditingRule(null)}
                className="rounded p-1 text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-text-muted">规则ID</label>
                <p className="font-data text-sm text-text-primary">R-{String(editingRule.id).padStart(2, '0')}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">触发条件 (IF)</label>
                <textarea
                  defaultValue={editingRule.condition}
                  rows={2}
                  className="w-full rounded-md border border-border-light bg-gray-100 px-3 py-2 text-xs text-text-primary outline-none focus:border-info"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">执行动作 (THEN)</label>
                <div className="rounded-md border border-border-light bg-gray-100 p-3">
                  {editingRule.actions.map((action, i) => (
                    <span key={i} className="mr-2 inline-block rounded bg-primary px-2 py-1 text-[10px] text-text-secondary">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">优先级</label>
                <select
                  defaultValue={editingRule.level || ''}
                  className="h-8 rounded-md border border-border-light bg-gray-100 px-3 text-xs text-text-primary outline-none"
                >
                  <option value="">无</option>
                  <option value="L1">L1 强拦截</option>
                  <option value="L2">L2 警示</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted">启用状态</label>
                <button onClick={() => toggleRule(editingRule.id)}>
                  {ruleEnabled[editingRule.id] ? (
                    <ToggleRight className="h-5 w-5 text-success" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-text-muted" />
                  )}
                </button>
              </div>
              <div className="pt-4 flex gap-3">
                <button className="flex items-center gap-1.5 rounded-md bg-info px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-info/80">
                  <Save className="h-3.5 w-3.5" />
                  保存
                </button>
                <button
                  onClick={() => setEditingRule(null)}
                  className="rounded-md bg-gray-100 px-4 py-2 text-xs text-text-secondary transition-colors hover:text-text-primary"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What-If Result */}
      {whatIfResult && (
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-semibold text-warning">What-If 影响预览</h4>
          </div>
          <p className="text-xs text-text-secondary">{whatIfResult}</p>
          <button
            onClick={() => setWhatIfResult('')}
            className="mt-2 text-xs text-text-muted hover:text-text-secondary"
          >
            关闭预览
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRules;
