import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  main: [
    'intro',
    {
      type: 'category',
      label: 'Playbook',
      link: { type: 'doc', id: 'playbook/index' },
      items: ['playbook/index'],
    },
    {
      type: 'category',
      label: 'Disciplines',
      link: { type: 'doc', id: 'disciplines/index' },
      items: [
        'disciplines/corpus-engineering',
        'disciplines/model-selection',
        'disciplines/llmops',
        'disciplines/ai-security-red-teaming',
        'disciplines/mcp',
        'disciplines/cicd',
        'disciplines/kubernetes-gitops',
        'disciplines/enterprise-security',
        'disciplines/reliability-engineering',
        'disciplines/compliance-governance',
      ],
    },
    {
      type: 'category',
      label: 'Projects',
      link: { type: 'doc', id: 'projects/index' },
      items: [
        'projects/project1-enterprise-knowledge-platform',
        'projects/project2-workflow-automation-platform',
        'projects/project3-insurance-compliance-copilot',
      ],
    },
  ],
};

export default sidebars;
