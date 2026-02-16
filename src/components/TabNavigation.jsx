export function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Accueil', icon: '🏠' },
    { id: 'hourly', label: 'Heures', icon: '🕐' },
    { id: 'radar', label: 'Radar', icon: '🌧️' },
    { id: 'satellite', label: 'Satellite', icon: '🛰️' },
    { id: 'forecast', label: 'Prévisions', icon: '📊' }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md px-3 py-3">
      <div className="flex gap-2 max-w-6xl mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-base transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
