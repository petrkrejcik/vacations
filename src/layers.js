import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

export function Layers({ activeLayers, onLayersChange, onSelectionModeChange }) {
  const [layers, setLayers] = useState(activeLayers || []);
  const [showNewLayerForm, setShowNewLayerForm] = useState(false);
  const [activeSelectionMode, setActiveSelectionMode] = useState(null); // {layerId, mode}
  const [editingLayer, setEditingLayer] = useState(null); // Layer being edited
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

  // Start editing a layer
  const startEditingLayer = (layer) => {
    // Close any open forms first
    setShowNewLayerForm(false);
    setEditingLayer({ ...layer });
  };

  // Cancel layer editing
  const cancelEditingLayer = () => {
    setEditingLayer(null);
  };

  // Save edited layer
  const saveEditedLayer = (e) => {
    e.preventDefault();
    
    if (!editingLayer.name.trim()) {
      alert('Please enter a layer name');
      return;
    }
    
    const updatedLayers = layers.map(layer => {
      if (layer.id === editingLayer.id) {
        return { 
          ...layer, 
          name: editingLayer.name.trim(),
          color: editingLayer.color
        };
      }
      return layer;
    });
    
    setLayers(updatedLayers);
    onLayersChange(updatedLayers);
    
    // Exit edit mode
    setEditingLayer(null);
  };

  // Handle input changes for editing layer
  const handleEditLayerChange = (field, value) => {
    setEditingLayer({
      ...editingLayer,
      [field]: value
    });
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

  // Layer Edit Form
  const renderEditForm = (layer) => {
    return html`
      <form onSubmit=${saveEditedLayer} class="bg-white p-3 rounded shadow-sm mt-1">
        <div class="mb-2">
          <label class="block text-xs mb-1">Layer name</label>
          <input 
            type="text" 
            value=${layer.name}
            onInput=${e => handleEditLayerChange('name', e.target.value)}
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="Layer name"
            required
          />
        </div>
        
        <div class="mb-3">
          <label class="block text-xs mb-1">Color</label>
          <input 
            type="color" 
            value=${layer.color}
            onInput=${e => handleEditLayerChange('color', e.target.value)}
            class="w-full h-8"
          />
        </div>
        
        <div class="flex justify-between">
          <button 
            type="button"
            onClick=${cancelEditingLayer}
            class="px-2 py-1 bg-gray-200 rounded text-xs"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Save
          </button>
        </div>
      </form>
    `;
  };

  return html`
    <div class="layers-sidebar w-64 bg-gray-50 p-4 border-r">
      <h2 class="text-xl font-bold mb-4">Layers</h2>
      
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
              <div class="flex gap-1">
                <button 
                  class="text-gray-500 text-xs p-1" 
                  onClick=${() => startEditingLayer(layer)}
                  title="Edit layer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </button>
                ${layer.id !== 'vacation' && html`
                  <button 
                    class="text-red-500 text-xs p-1" 
                    onClick=${() => deleteLayer(layer.id)}
                    title="Delete layer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                      <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                    </svg>
                  </button>
                `}
              </div>
            </div>
            
            ${editingLayer && editingLayer.id === layer.id 
              ? renderEditForm(editingLayer)
              : html`
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
              `}
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
          onClick=${() => {
            setEditingLayer(null);
            setShowNewLayerForm(true);
          }}
          class="w-full py-2 bg-blue-500 text-white rounded text-sm"
        >
          Add New Layer
        </button>
      `}
    </div>
  `;
} 