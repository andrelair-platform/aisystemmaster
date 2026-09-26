import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// Structured as a LEARNING PATH (not a flat reference list): Orientation → staged
// disciplines (Foundations → Platform → Security/Governance) → Projects → Assessment.
// The reference index pages are kept under "Reference" at the bottom.
const sidebars: SidebarsConfig = {
  main: [
    'intro',
    'learning-path',
    {
      type: 'category',
      label: 'Stage 0 · Orientation',
      collapsed: false,
      link: { type: 'doc', id: 'playbook/index' },
      items: ['playbook/index'],
    },
    {
      type: 'category',
      label: 'Stage 1 · AI Core Foundations',
      collapsed: false,
      items: [
        'disciplines/corpus-engineering',
        'disciplines/model-selection',
        'disciplines/llmops',
        'disciplines/mcp',
      ],
    },
    {
      type: 'category',
      label: 'Stage 2 · Platform & Delivery',
      collapsed: false,
      items: [
        'disciplines/cicd',
        'disciplines/kubernetes-gitops',
        'disciplines/reliability-engineering',
      ],
    },
    {
      type: 'category',
      label: 'Stage 3 · Security & Governance',
      collapsed: false,
      items: [
        'disciplines/enterprise-security',
        'disciplines/ai-security-red-teaming',
        'disciplines/compliance-governance',
      ],
    },
    {
      type: 'category',
      label: 'Stage 4 · Flagship Projects',
      collapsed: false,
      link: { type: 'doc', id: 'projects/index' },
      items: [
        'projects/project1-enterprise-knowledge-platform',
        'projects/project2-workflow-automation-platform',
        'projects/project3-insurance-compliance-copilot',
      ],
    },
    {
      type: 'category',
      label: 'Stage 5 · Prove Mastery',
      collapsed: false,
      items: ['mastery-checklist'],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: ['disciplines/index'],
    },
  ],
};

export default sidebars;
