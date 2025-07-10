# 🚀 DeepEyes Dashboard - Quick Setup Guide

## ✅ Current Status
Both servers are now running successfully!

- **Frontend Dashboard**: http://localhost:5173
- **Mock API Server**: http://localhost:3000

## 🎯 What You Can Do Now

### 1. **View the Dashboard**
Open your browser and navigate to: **http://localhost:5173**

You'll see a modern observability dashboard with:
- 📊 **Overview** - Key metrics and system health
- 📝 **Logs** - Advanced log filtering and search
- ⚠️ **Errors** - Error monitoring and trends
- ⚡ **Performance** - Response time and throughput metrics
- 🖥️ **System** - Resource usage monitoring

### 2. **Test the Features**
- **Search Logs**: Use the search bar to filter logs
- **Filter by Level**: Select different log levels (error, warning, info, debug)
- **Export Data**: Click the export button to download logs as CSV
- **Switch Tabs**: Navigate between different monitoring views
- **Refresh Data**: Click the refresh button to update metrics

### 3. **API Endpoints Available**
The mock server provides these endpoints:
- `GET http://localhost:3000/logs` - Fetch all logs
- `GET http://localhost:3000/logs/metrics` - Get log metrics by level
- `GET http://localhost:3000/health` - System health data
- `GET http://localhost:3000/performance` - Performance metrics

## 🛠️ Development Commands

```bash
# Start the frontend dashboard
npm run dev

# Start the mock API server
npm run mock-server

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Features Demonstrated

### **Modern UI/UX**
- Responsive design that works on all devices
- Professional styling with Tailwind CSS
- Smooth animations and transitions
- Color-coded status indicators

### **Real-time Monitoring**
- Live data updates
- Interactive charts with Recharts
- Toast notifications for user feedback
- Loading states and error handling

### **Advanced Filtering**
- Real-time search across log messages
- Filter by log level, time range
- Export functionality
- Pagination and sorting

### **Comprehensive Views**
- **Overview**: High-level metrics and trends
- **Logs**: Detailed log management
- **Errors**: Error-focused monitoring
- **Performance**: Performance metrics
- **System**: Infrastructure monitoring

## 🔧 Customization

### **Colors and Styling**
- Edit `tailwind.config.js` for color schemes
- Modify `src/index.css` for custom styles
- Update component styles in `src/App.tsx`

### **Data Sources**
- Replace mock server with real API endpoints
- Update API URLs in `src/App.tsx`
- Add new data types and interfaces

### **Charts and Metrics**
- Add new chart types from Recharts
- Create custom metrics calculations
- Implement real-time data streaming

## 🚀 Next Steps

1. **Connect Real Data**: Replace mock server with your actual API
2. **Add Authentication**: Implement user login and role-based access
3. **Real-time Updates**: Add WebSocket connections for live data
4. **Alerts**: Implement alerting and notification systems
5. **Deploy**: Deploy to production environment

## 🆘 Troubleshooting

### **If the dashboard doesn't load:**
1. Check if both servers are running
2. Verify ports 5173 and 3000 are available
3. Check browser console for errors
4. Restart servers with `npm run dev` and `npm run mock-server`

### **If charts don't display:**
1. Check if Recharts is properly installed
2. Verify data format matches expected structure
3. Check browser console for JavaScript errors

---

**🎉 Your observability dashboard is ready!** 

Open http://localhost:5173 to start monitoring your applications with a professional-grade interface similar to New Relic, Datadog, and SigNoz. 