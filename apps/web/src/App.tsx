import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Satellites } from './pages/Satellites';
import { SituationalPicture } from './pages/SituationalPicture';
import { Alerts } from './pages/Alerts';
import { Decisions } from './pages/Decisions';
import { WebSocketProvider } from './hooks/useWebSocket';

function App() {
  return (
    <WebSocketProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Satellites />} />
          <Route path="/satellites" element={<Satellites />} />
          <Route path="/situational-picture" element={<SituationalPicture />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/decisions" element={<Decisions />} />
        </Routes>
      </Layout>
    </WebSocketProvider>
  );
}

export default App;
