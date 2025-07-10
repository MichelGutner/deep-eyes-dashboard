# DeepEyes Dashboard - Modern Observability Platform

A comprehensive observability dashboard similar to New Relic, Datadog, and SigNoz for monitoring logs, errors, performance metrics, and system health.

## 🚀 Features

### 📊 Overview Dashboard
- **Key Metrics Cards**: Total errors, uptime, response time, active users
- **Error Trends Chart**: Real-time error tracking over time
- **Log Distribution**: Pie chart showing log levels distribution
- **System Health**: CPU, memory, disk, and network usage with progress bars

### 📝 Logs Management
- **Advanced Filtering**: Filter by log level, time range, and search terms
- **Real-time Search**: Search across messages, applications, and user IDs
- **Export Functionality**: Export filtered logs to CSV format
- **Responsive Table**: Clean, modern table with hover effects and status badges

### ⚠️ Error Monitoring
- **Error Distribution**: Bar chart showing error patterns
- **Error Trends**: Area chart tracking error frequency over time
- **Recent Errors**: Detailed error cards with context information
- **Error Analytics**: Percentage changes and trend indicators

### ⚡ Performance Monitoring
- **Response Time Tracking**: Line chart showing API response times
- **Throughput Monitoring**: Area chart displaying requests per second
- **Performance Metrics**: Average response time, RPS, and success rate
- **Trend Analysis**: Week-over-week performance comparisons

### 🖥️ System Health
- **Resource Usage**: Real-time CPU, memory, disk, and network monitoring
- **System Information**: Server details, region, instance type, and OS
- **Health Indicators**: Visual progress bars with color-coded status
- **Uptime Tracking**: System availability percentage

## 🚀 **Funcionalidades Avançadas**

### **🔔 Sistema de Alertas**
- **Alertas em Tempo Real**: Notificações instantâneas para eventos críticos
- **Regras de Alerta Personalizáveis**: Configure condições e thresholds
- **Filtros e Busca**: Encontre alertas específicos rapidamente
- **Gerenciamento de Status**: Marque alertas como resolvidos, em investigação, etc.
- **Histórico de Alertas**: Visualize histórico completo de alertas

### **📊 APM (Application Performance Monitoring)**
- **Service Map**: Visualização interativa da arquitetura de microserviços
- **Distributed Tracing**: Rastreamento de requisições através dos serviços
- **Performance Metrics**: Métricas detalhadas de performance
- **Resource Usage**: Monitoramento de recursos do sistema
- **Error Tracking**: Rastreamento e análise de erros

### **👥 Sistema de Autenticação e Autorização**
- **Gerenciamento de Usuários**: CRUD completo de usuários
- **Controle de Roles**: Defina permissões e papéis
- **Sessões Ativas**: Monitore sessões de usuários
- **Audit Logs**: Registro de todas as ações dos usuários
- **Segurança**: MFA, IP whitelist, políticas de senha

### **🌐 Sistema Real-Time**
- **WebSocket Connections**: Conexões em tempo real para dados ao vivo
- **Live Data Streaming**: Streaming de dados em tempo real
- **Real-time Collaboration**: Colaboração em tempo real entre equipes
- **Live Events**: Eventos ao vivo com notificações
- **Connection Status**: Monitoramento de status das conexões

### **🔍 Logs Avançados**
- **Log Parsing**: Análise e parsing automático de logs
- **Advanced Filtering**: Filtros avançados por múltiplos critérios
- **Search & Analytics**: Busca e análise avançada de logs
- **Log Export**: Exportação de logs em múltiplos formatos
- **Log Statistics**: Estatísticas detalhadas dos logs

### **📈 Métricas Customizadas**
- **Custom Metric Creation**: Criação de métricas personalizadas
- **Multiple Chart Types**: Gráficos de linha, barra, pizza
- **Alert Thresholds**: Configuração de alertas para métricas
- **Real-time Updates**: Atualizações em tempo real
- **Metric Templates**: Templates pré-definidos para métricas comuns

### **🛡️ Sistema de Segurança**
- **Threat Detection**: Detecção de ameaças em tempo real
- **Access Control**: Controle de acesso granular
- **Audit Logs**: Logs de auditoria completos
- **Security Monitoring**: Monitoramento de segurança
- **Threat Intelligence**: Inteligência de ameaças

### **🤖 Machine Learning**
- **Anomaly Detection**: Detecção automática de anomalias
- **Predictive Analytics**: Análise preditiva
- **Automated Insights**: Insights automatizados
- **ML Model Management**: Gerenciamento de modelos ML
- **Performance Metrics**: Métricas de performance dos modelos

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deep-eyes-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### API Endpoints
The dashboard expects the following API endpoints:

- `GET /logs` - Fetch all logs
- `GET /logs/metrics` - Fetch log metrics by level
- `GET /health` - System health data
- `GET /performance` - Performance metrics
- `GET /realtime` - Real-time metrics and events
- `GET /security` - Security events and threats
- `GET /ml` - Machine learning insights and anomalies
- `GET /custom-metrics` - Custom metrics data

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

## 📊 API Data Structure

### Log Entry
```typescript
interface Log {
  _id: string;
  level: 'error' | 'warning' | 'info' | 'debug' | 'success';
  message: string;
  environment?: string;
  appName?: string;
  userId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  traceId?: string;
  spanId?: string;
}
```

### Metrics Response
```typescript
interface Metric {
  level: string;
  sum: number;
}
```

## 🎨 Customization

### Colors
The dashboard uses a consistent color scheme defined in `tailwind.config.js`:

- **Primary**: Blue shades (`primary-50` to `primary-900`)
- **Error**: Red (`#ef4444`)
- **Warning**: Yellow (`#f59e0b`)
- **Info**: Blue (`#3b82f6`)
- **Success**: Green (`#10b981`)
- **Debug**: Gray (`#6b7280`)

### Styling
Custom CSS classes are available in `src/index.css`:

- `.card` - Standard card container
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.status-badge` - Status indicator badges
- `.status-error`, `.status-warning`, etc. - Level-specific badge styles

## 🔄 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── App.tsx          # Main dashboard component
├── index.css        # Global styles and Tailwind imports
├── main.tsx         # Application entry point
└── assets/          # Static assets
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "80"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**DeepEyes Dashboard** - Your comprehensive observability solution for modern applications.
