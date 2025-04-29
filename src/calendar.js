import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

// Month names for display
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Day names for header
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Default vacation layer
const DEFAULT_VACATION_LAYER = {
  id: 'vacation',
  name: 'My vacations',
  color: '#4ade80', // green-400
  active: true,
  dates: []
};

export function Calendar({ initialLayers, activeSelectionMode }) {
  // State for the current year
  const [year, setYear] = useState(new Date().getFullYear());
  // State for active layers
  const [layers, setLayers] = useState([]);
  // Count of vacation days used
  const [vacationDaysUsed, setVacationDaysUsed] = useState(0);
  // Total available vacation days per year
  const [totalVacationDays, setTotalVacationDays] = useState(30);
  
  // Effect to get year from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const yearParam = params.get('year');
    if (yearParam && !isNaN(yearParam)) {
      setYear(parseInt(yearParam, 10));
    }
  }, []);

  // Effect to load layers and settings from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('vacationPlannerData');
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Load layers or create default vacation layer if it doesn't exist
        if (data.layers && Array.isArray(data.layers)) {
          if (!data.layers.find(layer => layer.id === 'vacation')) {
            data.layers.push(DEFAULT_VACATION_LAYER);
          }
          setLayers(data.layers);
        } else {
          setLayers([DEFAULT_VACATION_LAYER]);
        }
        
        // Load total vacation days setting
        if (data.totalVacationDays) {
          setTotalVacationDays(data.totalVacationDays);
        }
        
        // Calculate used vacation days
        const vacationLayer = data.layers?.find(layer => layer.id === 'vacation');
        if (vacationLayer && vacationLayer.dates) {
          // Only count dates from the current year
          const yearString = `${year}-`;
          const datesThisYear = vacationLayer.dates.filter(date => date.startsWith(yearString));
          setVacationDaysUsed(datesThisYear.length);
        }
      } else {
        // Initialize with default vacation layer
        setLayers([DEFAULT_VACATION_LAYER]);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setLayers([DEFAULT_VACATION_LAYER]);
    }
  }, [year]);

  // Effect to update from parent component layers
  useEffect(() => {
    if (initialLayers && initialLayers.length > 0) {
      // Make sure vacation layer exists
      if (!initialLayers.find(layer => layer.id === 'vacation')) {
        setLayers([...initialLayers, DEFAULT_VACATION_LAYER]);
      } else {
        setLayers(initialLayers);
      }
      
      // Update vacation days count
      const vacationLayer = initialLayers.find(layer => layer.id === 'vacation');
      if (vacationLayer && vacationLayer.dates) {
        const yearString = `${year}-`;
        const datesThisYear = vacationLayer.dates.filter(date => date.startsWith(yearString));
        setVacationDaysUsed(datesThisYear.length);
      }
    }
  }, [initialLayers, year]);

  // Save data to localStorage
  const saveData = (updatedLayers) => {
    try {
      const data = {
        layers: updatedLayers,
        totalVacationDays
      };
      localStorage.setItem('vacationPlannerData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  };

  // Function to toggle a date in a layer
  const toggleDateInLayer = (date, layerId, action) => {
    if (!date) return;
    
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const updatedLayers = layers.map(layer => {
      if (layer.id !== layerId) return layer;
      
      let updatedDates = [...(layer.dates || [])];
      
      if (action === 'add' && !updatedDates.includes(dateString)) {
        updatedDates.push(dateString);
      } else if (action === 'remove' && updatedDates.includes(dateString)) {
        updatedDates = updatedDates.filter(d => d !== dateString);
      }
      
      return { ...layer, dates: updatedDates };
    });
    
    setLayers(updatedLayers);
    saveData(updatedLayers);
    
    // Update vacation days count if vacation layer was updated
    if (layerId === 'vacation') {
      const vacationLayer = updatedLayers.find(layer => layer.id === 'vacation');
      if (vacationLayer) {
        const yearString = `${year}-`;
        const datesThisYear = vacationLayer.dates.filter(date => date.startsWith(yearString));
        setVacationDaysUsed(datesThisYear.length);
      }
    }
  };

  // Function to handle day click
  const handleDayClick = (date) => {
    if (!date || !activeSelectionMode) return;
    
    // Use the active layer and mode from props
    toggleDateInLayer(date, activeSelectionMode.layerId, activeSelectionMode.mode);
  };

  // Function to generate all days in a month
  function getDaysInMonth(month, year) {
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate the first day offset (0 is Monday in our display)
    let firstDayOffset = firstDay.getDay() - 1;
    if (firstDayOffset < 0) firstDayOffset = 6; // Sunday should be last
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOffset; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add actual days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        day,
        date: new Date(year, month, day)
      });
    }
    
    return days;
  }

  // Function to check if a date has any layer events
  function getLayersForDate(date) {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return layers.filter(layer => {
      if (!layer.active) return false;
      return layer.dates && layer.dates.includes(dateString);
    });
  }

  // Determine cursor style based on selection mode
  const getCursorStyle = (date) => {
    if (!date || !activeSelectionMode) return '';
    
    const isClickable = !!date && !!activeSelectionMode;
    if (!isClickable) return '';
    
    return 'cursor-pointer hover:bg-gray-100';
  };

  return html`
    <div class="calendar-container">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Calendar ${year}</h2>
        
        <div class="controls flex gap-4 items-center">
          <div class="vacation-stats text-sm">
            <span class="font-medium">Vacation days: </span>
            <span class="${vacationDaysUsed > totalVacationDays ? 'text-red-500' : ''}">${vacationDaysUsed}</span> / ${totalVacationDays}
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-4 gap-6">
        ${MONTHS.map((monthName, monthIndex) => {
          const days = getDaysInMonth(monthIndex, year);
          return html`
            <div class="month-container border rounded-lg p-3 shadow-sm">
              <h3 class="text-lg font-semibold mb-2">${monthName}</h3>
              <div class="grid grid-cols-7 gap-1">
                ${DAYS.map(day => html`
                  <div class="day-header text-xs text-center font-medium pb-1">${day}</div>
                `)}
                ${days.map(({ day, date }) => {
                  const dateLayers = getLayersForDate(date);
                  const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
                  
                  return html`
                    <div 
                      class="day-cell h-7 w-7 flex items-center justify-center text-xs rounded-full relative
                        ${!day ? 'opacity-0' : ''} 
                        ${isWeekend ? 'text-red-500' : ''}
                        ${getCursorStyle(date)}"
                      onClick=${() => handleDayClick(date)}
                    >
                      <span class="z-10">${day || ''}</span>
                      
                      ${dateLayers.map((layer, idx, array) => {
                        // Calculate inset percentage based on layer position and total number of layers
                        // Start from the center and move outward
                        // Ensuring rings are evenly distributed and properly spaced
                        const totalLayers = array.length;
                        // Adjust inset calculations to accommodate thicker borders
                        const ringWidth = totalLayers > 1 ? (45 / totalLayers) : 35;
                        const inset = 8 + ((totalLayers - idx - 1) * ringWidth / 2);
                        // Determine border thickness (increased for better visibility)
                        const borderThickness = totalLayers > 2 ? '2px' : '2.5px';
                        
                        return html`
                          <div 
                            class="absolute rounded-full pointer-events-none" 
                            style="
                              top: ${inset}%; 
                              right: ${inset}%; 
                              bottom: ${inset}%; 
                              left: ${inset}%; 
                              border: ${borderThickness} solid ${layer.color}; 
                              z-index: ${totalLayers - idx};"
                            title="${layer.name}"
                          ></div>
                        `;
                      })}
                    </div>
                  `;
                })}
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

