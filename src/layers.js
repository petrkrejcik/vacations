import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

export function Layers({ activeLayers, onLayersChange, onSelectionModeChange }) {
  const [layers, setLayers] = useState(activeLayers || []);
  const [showNewLayerForm, setShowNewLayerForm] = useState(false);
  const [activeSelectionMode, setActiveSelectionMode] = useState(null); // {layerId, mode}
  const [newLayer, setNewLayer] = useState({
    name: '',
    color: '#3b82f6' // Default color (blue-500)
  });

  // Update local state when props change
  useEffect(() => {
    setLayers(activeLayers || []);
  }, [activeLayers]);

  // Handle layer visibility toggle
  const toggleLayerVisibility = (layerId) => {
    const updatedLayers = layers.map(layer => {
      if (layer.id === layerId) {
        return { ...layer, active: !layer.active };
      }
      return layer;
    });
    
    setLayers(updatedLayers);
    onLayersChange(updatedLayers);
  };

  // Toggle selection mode for a layer
  const toggleSelectionMode = (layerId, mode) => {
    // If clicking the same mode that's already active, turn it off
    if (activeSelectionMode && activeSelectionMode.layerId === layerId && activeSelectionMode.mode === mode) {
      setActiveSelectionMode(null);
      if (onSelectionModeChange) {
        onSelectionModeChange(null, null);
      }
    } else {
      // Otherwise activate the selected mode for this layer
      setActiveSelectionMode({ layerId, mode });
      if (onSelectionModeChange) {
        onSelectionModeChange(layerId, mode);
      }
    }
  };

  // Generate a unique ID for a new layer
  const generateLayerId = () => {
    return 'layer_' + Date.now();
  };

  // Add a new layer
  const addNewLayer = (e) => {
    e.preventDefault();
    
    if (!newLayer.name.trim()) {
      alert('Please enter a layer name');
      return;
    }
    
    const layerId = generateLayerId();
    const layer = {
      id: layerId,
      name: newLayer.name.trim(),
      color: newLayer.color,
      active: true,
      dates: []
    };
    
    const updatedLayers = [...layers, layer];
    setLayers(updatedLayers);
    onLayersChange(updatedLayers);
    
    // Reset form
    setNewLayer({
      name: '',
      color: '#3b82f6'
    });
    setShowNewLayerForm(false);
  };

  // Delete a layer
  const deleteLayer = (layerId) => {
    // Prevent deleting the vacation layer
    if (layerId === 'vacation') {
      alert('Cannot delete the default vacation layer');
      return;
    }
    
    if (confirm('Are you sure you want to delete this layer?')) {
      const updatedLayers = layers.filter(layer => layer.id !== layerId);
      setLayers(updatedLayers);
      onLayersChange(updatedLayers);
      
      // Clear selection mode if the deleted layer was active
      if (activeSelectionMode && activeSelectionMode.layerId === layerId) {
        setActiveSelectionMode(null);
        if (onSelectionModeChange) {
          onSelectionModeChange(null, null);
        }
      }
    }
  };

  return html`
    <div class="layers-sidebar w-64 bg-gray-50 p-4 border-r">
      
      <ul class="space-y-2 mb-4">
        ${layers.map(layer => html`
          <li class="p-2 bg-white rounded shadow-sm">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id=${`layer-${layer.id}`}
                  checked=${layer.active} 
                  onChange=${() => toggleLayerVisibility(layer.id)}
                />
                <div 
                  class="w-4 h-4 rounded-full" 
                  style="background-color: ${layer.color}"
                ></div>
                <label for=${`layer-${layer.id}`} class="text-sm font-medium">
                  ${layer.name}
                </label>
              </div>
              ${layer.id !== 'vacation' && html`
                <button 
                  class="text-red-500 text-xs" 
                  onClick=${() => deleteLayer(layer.id)}
                  title="Delete layer"
                >
                  ×
                </button>
              `}
            </div>
            
            <div class="flex justify-end gap-1 mt-1">
              <button 
                class="p-1 rounded-full ${activeSelectionMode && activeSelectionMode.layerId === layer.id && activeSelectionMode.mode === 'add' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}"
                onClick=${() => toggleSelectionMode(layer.id, 'add')}
                title="Add dates to this layer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              </button>
              <button 
                class="p-1 rounded-full ${activeSelectionMode && activeSelectionMode.layerId === layer.id && activeSelectionMode.mode === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}"
                onClick=${() => toggleSelectionMode(layer.id, 'remove')}
                title="Remove dates from this layer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path d="M6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
                </svg>
              </button>
            </div>
          </li>
        `)}
      </ul>
      
      ${showNewLayerForm ? html`
        <form onSubmit=${addNewLayer} class="bg-white p-3 rounded shadow-sm">
          <div class="mb-2">
            <label class="block text-xs mb-1">Layer name</label>
            <input 
              type="text" 
              value=${newLayer.name}
              onInput=${e => setNewLayer({...newLayer, name: e.target.value})}
              class="w-full px-2 py-1 border rounded text-sm"
              placeholder="Layer name"
              required
            />
          </div>
          
          <div class="mb-3">
            <label class="block text-xs mb-1">Color</label>
            <input 
              type="color" 
              value=${newLayer.color}
              onInput=${e => setNewLayer({...newLayer, color: e.target.value})}
              class="w-full h-8"
            />
          </div>
          
          <div class="flex justify-between">
            <button 
              type="button"
              onClick=${() => setShowNewLayerForm(false)}
              class="px-2 py-1 bg-gray-200 rounded text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Add Layer
            </button>
          </div>
        </form>
      ` : html`
        <button 
          onClick=${() => setShowNewLayerForm(true)}
          class="w-full py-2 bg-blue-500 text-white rounded text-sm"
        >
          Add New Layer
        </button>
      `}
    </div>
  `;
} 