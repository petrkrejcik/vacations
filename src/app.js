import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { Calendar } from './calendar.js';
import { Layers } from './layers.js';

// Default vacation layer that must always exist
const DEFAULT_VACATION_LAYER = {
  id: 'vacation',
  name: 'My vacations', // Note: Using "My vacations" as requested, not "My Vacations"
  color: '#4ade80', // green-400
  active: true,
  dates: []
};

export function App() {
  const [layers, setLayers] = useState([]);
  const [activeSelectionMode, setActiveSelectionMode] = useState(null);
  
  // Load layers from localStorage on initial load
  useEffect(() => {
    try {
      let data = { layers: [DEFAULT_VACATION_LAYER] };
      const storedData = localStorage.getItem('vacationPlannerData');
      
      if (storedData) {
        // Parse existing data
        data = JSON.parse(storedData);
        
        // Ensure vacation layer exists
        if (!data.layers || !Array.isArray(data.layers)) {
          data.layers = [DEFAULT_VACATION_LAYER];
        } else if (!data.layers.find(layer => layer.id === 'vacation')) {
          data.layers.push(DEFAULT_VACATION_LAYER);
        }
      }
      
      // Always save back to localStorage to ensure default layer exists
      localStorage.setItem('vacationPlannerData', JSON.stringify(data));
      
      // Update state
      setLayers(data.layers);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Initialize with default layer on error
      const data = { layers: [DEFAULT_VACATION_LAYER] };
      localStorage.setItem('vacationPlannerData', JSON.stringify(data));
      setLayers(data.layers);
    }
  }, []);
  
  // Handle layer changes
  const handleLayersChange = (updatedLayers) => {
    // Ensure vacation layer exists and can't be removed
    if (!updatedLayers.find(layer => layer.id === 'vacation')) {
      updatedLayers.push(DEFAULT_VACATION_LAYER);
    }
    
    // Save to localStorage, merging with existing data
    try {
      const storedData = localStorage.getItem('vacationPlannerData') || '{}';
      const data = JSON.parse(storedData);
      
      // If we don't have layers yet in localStorage, just set them
      if (!data.layers || !Array.isArray(data.layers)) {
        data.layers = updatedLayers;
      } else {
        // Merge updated layers with existing data, preserving dates
        data.layers = updatedLayers.map(updatedLayer => {
          const existingLayer = data.layers.find(l => l.id === updatedLayer.id);
          // If the layer exists, merge it preserving dates, otherwise use the new layer
          if (existingLayer) {
            return {
              ...existingLayer,          // Keep all existing properties (including dates)
              ...updatedLayer,           // Update with new properties (name, color, active)
              dates: existingLayer.dates // Explicitly ensure dates are preserved
            };
          }
          return updatedLayer; // This is a new layer
        });
        
        // Add any layers that exist in storage but weren't in the update
        // (this shouldn't normally happen, but it's a safeguard)
        const updatedLayerIds = updatedLayers.map(l => l.id);
        data.layers.push(...data.layers
          .filter(l => !updatedLayerIds.includes(l.id))
          .filter(l => l.id !== 'vacation') // Don't duplicate vacation layer
        );
      }
      
      localStorage.setItem('vacationPlannerData', JSON.stringify(data));
      setLayers(data.layers);
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      // Still update state even if localStorage fails
      setLayers(updatedLayers);
    }
  };

  // Handle selection mode changes from Layers component
  const handleSelectionModeChange = (layerId, mode) => {
    if (!layerId || !mode) {
      setActiveSelectionMode(null);
    } else {
      setActiveSelectionMode({ layerId, mode });
    }
  };

  return html`
    <div class="vacation-planner-app">
      <main class="flex min-h-[calc(100vh-64px)]">
        <${Layers} 
          activeLayers=${layers} 
          onLayersChange=${handleLayersChange} 
          onSelectionModeChange=${handleSelectionModeChange}
        />
        <div class="flex-1 p-6 overflow-auto">
          <${Calendar} 
            initialLayers=${layers} 
            activeSelectionMode=${activeSelectionMode}
          />
        </div>
      </main>
    </div>
  `;
}

render(html`<${App} />`, document.getElementById('app'));
