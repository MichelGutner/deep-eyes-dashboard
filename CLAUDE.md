# Deep Eyes Dashboard — CLAUDE.md

Plataforma de observabilidade (estilo New Relic/Datadog) construída em React + TypeScript + Tailwind.

## Comandos essenciais

```bash
# Dev server
yarn dev                # http://localhost:5173

# Mock API (logs) — porta 3000
yarn mock-server        # http://localhost:3000/logs

# Build de produção
yarn build

# Lint
yarn lint
```

## Arquitetura

Aplicação SPA com navegação baseada em tabs (sem React Router). Toda a troca de "página" acontece via `activeTab` no `App.tsx`.

```
src/
├── App.tsx                   # Layout principal: sidebar, header, roteamento por tab
├── constants/
│   └── colors.ts             # Paleta de cores unificada por log level — usar sempre daqui
├── hooks/
│   ├── useDrawer.ts          # Hook genérico para painéis laterais (fecha com Esc)
│   └── useSettings.ts        # Acessa SettingsContext
├── contexts/
│   └── SettingsContext.tsx   # Tema, idioma, refresh interval — persiste em localStorage
├── services/
│   └── mlService.ts          # Axios para API de ML em localhost:3001
├── i18n/
│   └── locales/              # 10 idiomas: en, pt, es, fr, de, it, ja, zh, ru, ar
├── components/               # 22 componentes (ver tabela abaixo)
└── main.tsx
```

### Componentes principais

| Componente | Responsabilidade |
|---|---|
| `AdvancedLogs` | Tabela de logs com drawer, live tail, filtros, export CSV |
| `LogDrawer` | Painel lateral de detalhes do log (stack trace, trace, metadata) |
| `CommandPalette` | Modal ⌘K com busca fuzzy nas abas e ações globais |
| `ErrorHeatmap` | Grid 24h×7dias de distribuição de erros por hora/dia |
| `APMMonitoring` | Mapa de serviços, traces, métricas de performance |
| `DistributedTracing` | Traces com spans, service mesh, bottlenecks |
| `AlertSystem` | Alertas com regras, notificações, workflow ack/resolve |
| `IncidentManagement` | Incidentes com timeline, runbooks, atribuição de equipe |
| `MachineLearning` | Anomalias, previsões, modelos ML |
| `EnhancedSecurity` | SOC2/GDPR/HIPAA compliance, vulnerabilidades, ameaças |
| `DashboardBuilder` | Drag-drop de widgets (chart, metric, table, gauge) |
| `RealTimeSystem` | Métricas ao vivo simuladas + chat colaborativo |

## APIs

```
GET  http://localhost:3000/logs          # Lista de logs (Log[])
GET  http://localhost:3000/logs/metrics  # { level, sum }[] — usado no pie chart
GET  http://localhost:3000/health        # SystemHealth
```

O `mock-server.js` (Express, porta 3000) simula esses endpoints. Todos os outros dados são mock gerados nos próprios componentes.

API de ML (não implementada, definida em `mlService.ts`):
```
http://localhost:3001  — endpoints POST /ml/*, GET /ml/health
```

## Tipos de dados centrais

```typescript
// App.tsx — Log vindo da API
interface Log {
  _id: string;
  level: string;           // 'error' | 'warning' | 'info' | 'debug'
  message: string;
  environment?: string;
  appName?: string;
  userId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;       // ISO 8601
  traceId?: string;
  spanId?: string;
}

// AdvancedLogs.tsx — LogEntry (mock interno rico)
interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  traceId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;       // ms
  metadata: Record<string, unknown>;
  parsed: { method?, path?, statusCode?, responseTime?, errorType?, stackTrace? };
}
```

## Padrões de código

### Cores — sempre usar `src/constants/colors.ts`
```typescript
import { getLevelColors } from '../constants/colors';
const colors = getLevelColors(log.level);
// colors.badge  → classes Tailwind para badge
// colors.bar    → hex para gráficos Recharts
// colors.border → classes Tailwind para border-left
// colors.hex    → hex puro
```

### Drawer — usar `useDrawer`
```typescript
const drawer = useDrawer<MinhaInterface>();
// drawer.open(item)  → abre com dado
// drawer.close()     → fecha (Esc já funciona automaticamente)
// drawer.isOpen      → boolean
// drawer.data        → item atual ou null
```

### i18n — todas as strings visíveis ao usuário
```typescript
const { t } = useTranslation();
// t('chave_da_string')
// Chaves definidas em src/i18n/locales/en.json
```

### Toast notifications
```typescript
import toast from 'react-hot-toast';
toast.success('mensagem');
toast.error('erro');
```

### Gráficos — Recharts
- Sempre usar `<ResponsiveContainer width="100%" height={N}>` como wrapper
- Tooltips com `contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: 12 }}`
- Gradientes para AreaChart: definir `<defs><linearGradient>` dentro do `<AreaChart>`
- Cores dos dados: usar `CHART_COLORS` de `src/constants/colors.ts`

### Dark mode
- Tailwind `dark:` prefix em todas as classes de cor
- Tema controlado por `SettingsContext` via classe `.dark` no `<html>`
- Nunca hardcodar cores sem o par `dark:*`

## Adicionar uma nova aba

1. Criar componente em `src/components/NovaAba.tsx`
2. Adicionar ao array `tabs` em `App.tsx` com id, label (via `t()`), e ícone Lucide
3. Adicionar `{activeTab === 'nova-aba' && <NovaAba />}` no `<main>`
4. Adicionar strings ao `src/i18n/locales/en.json` (e idealmente nos outros 9 idiomas)

## Adicionar uma nova feature de drawer

1. Definir interface do dado
2. `const drawer = useDrawer<MinhaInterface>()` no componente pai
3. Criar `<MeuDrawer log={drawer.data} isOpen={drawer.isOpen} onClose={drawer.close} />`
4. Dentro do drawer: overlay + painel com `translate-x-0` / `translate-x-full` para animação

## Navegação programática entre abas

O `activeTab` e `setActiveTab` ficam em `App.tsx`. Para navegar a partir de um componente filho sem prop drilling, usar o `CommandPalette` (já conectado) ou receber `onNavigate` como prop:

```typescript
// Em App.tsx
<AdvancedLogs onNavigateToTrace={(traceId) => {
  setActiveTab('apm');
  toast.success(`Trace: ${traceId}`);
}} />
```

## Estado global

Apenas `SettingsContext` é global. Todo o resto é estado local por componente. Não há Redux, Zustand ou Context adicional.

Configurações persistidas em `localStorage`:
- `deepEyes-display-settings` → tema, idioma, timezone, dateFormat, refreshInterval
- `deepEyes-general-settings` → dashboardName

## Observações importantes

- **Sem React Router**: deep links não funcionam — URL não muda ao trocar de aba. Adicioná-lo é uma melhoria pendente identificada.
- **Dados mock**: a maioria dos componentes gera dados fictícios internamente. Apenas `App.tsx` faz fetch real (`/logs`, `/logs/metrics`).
- **Live Tail**: `AdvancedLogs` simula chegada de novos logs via `setInterval`. Em produção, substituir por WebSocket.
- **ML Service**: `mlService.ts` define endpoints mas nenhum componente faz chamadas reais — tudo simulado.
- **i18n incompleto**: nem todas as strings dos componentes novos foram adicionadas aos arquivos de localização. O fallback é o texto em português diretamente no JSX.
