import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Satellite, Trash2, Edit } from 'lucide-react';
import { api } from '../services/api';
import { SatelliteInput } from '@eyewitness/core';

export function Satellites() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSatellite, setEditingSatellite] = useState<any>(null);
  const [formData, setFormData] = useState<SatelliteInput>({
    name: '',
    noradId: null,
    tle: null,
    omm: null,
  });

  const queryClient = useQueryClient();

  const { data: satellites, isLoading } = useQuery({
    queryKey: ['satellites'],
    queryFn: api.getSatellites,
  });

  const addMutation = useMutation({
    mutationFn: api.addSatellite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['satellites'] });
      setShowAddForm(false);
      setFormData({ name: '', noradId: null, tle: null, omm: null });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SatelliteInput }) =>
      api.updateSatellite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['satellites'] });
      setEditingSatellite(null);
      setFormData({ name: '', noradId: null, tle: null, omm: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSatellite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['satellites'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSatellite) {
      updateMutation.mutate({ id: editingSatellite.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (satellite: any) => {
    setEditingSatellite(satellite);
    setFormData({
      name: satellite.name,
      noradId: satellite.noradId,
      tle: satellite.tle,
      omm: satellite.omm,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingSatellite(null);
    setFormData({ name: '', noradId: null, tle: null, omm: null });
  };

  const handleDemoData = () => {
    const demoSatellites = [
      {
        name: 'ODIN',
        noradId: '2001-007A',
        tle: '1 26702U 01007A   25297.94592849  .00034621  00000+0  67353-3 0  9992\n2 26702  97.4305 324.4505 0002076 333.4063  26.7080 15.47511951352773',
        omm: null,
      },
      {
        name: 'HUBBLE 6',
        noradId: '2025-135AL',
        tle: '1 64562U 25135AL  25297.91337896  .00003332  00000+0  33467-3 0  9996\n2 64562  97.7600  50.2244 0000877 113.4478 246.6834 14.91947225 18771',
        omm: null,
      },
      {
        name: 'STARLINK-34280',
        noradId: '2025-137A',
        tle: '1 64594U 25137A   25297.85813543  .00047922  00000+0  11990-2 0  9993\n2 64594  53.1613 251.4807 0001196  90.9024 269.2118 15.39657082 19866',
        omm: null,
      },
      {
        name: 'EXPLORER 1',
        noradId: '4',
        tle: '1 00004U 58001  A 70090.03500497  .07718844 +00000-0 +00000-0 0  9991\n2 00004 033.1468 334.6171 0024739 311.5310 048.3249 16.27546304584022',
        omm: null,
      },
      {
        name: 'THOR ABLESTAR R/B',
        noradId: '47',
        tle: '1 00047U 60007C   25297.80579634  .00001148  00000-0  26461-3 0  9997\n2 00047  66.6646 319.0900 0225388 309.5079  48.6287 14.44911159416791',
        omm: null,
      },
      {
        name: 'ECHO 1',
        noradId: '49',
        tle: '1 00049U 60009  A 68144.86617407  .41988289 +00000-0 +00000-0 0  9999\n2 00049 047.1857 303.1560 0018299 276.1888 083.6866 15.53427992360298',
        omm: null,
      },
    ];

    // Add all demo satellites
    demoSatellites.forEach((satellite, index) => {
      setTimeout(() => {
        addMutation.mutate(satellite);
      }, index * 500); // Stagger the requests by 500ms each
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-space-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Satellites</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleDemoData}
            className="btn btn-secondary flex items-center"
            disabled={addMutation.isPending}
          >
            <Satellite className="h-4 w-4 mr-2" />
            Add Demo Satellites
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Satellite
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            {editingSatellite ? 'Edit Satellite' : 'Add New Satellite'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                NORAD ID
              </label>
              <input
                type="text"
                value={formData.noradId || ''}
                onChange={(e) => setFormData({ ...formData, noradId: e.target.value || null })}
                className="input"
                placeholder="e.g., 25544"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TLE (Two-Line Element)
              </label>
              <textarea
                value={formData.tle || ''}
                onChange={(e) => setFormData({ ...formData, tle: e.target.value || null })}
                className="input h-24"
                placeholder="Paste TLE data here..."
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="btn btn-primary">
                {editingSatellite ? 'Update' : 'Add'} Satellite
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {satellites?.map((satellite: any) => (
          <div key={satellite.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Satellite className="h-5 w-5 text-space-400 mr-3" />
                <div>
                  <h3 className="font-semibold text-white">{satellite.name}</h3>
                  <p className="text-sm text-gray-400">
                    NORAD ID: {satellite.noradId || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(satellite)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(satellite.id)}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {satellite.position && (
              <div className="mt-4 text-sm text-gray-400">
                <p>Position: ({satellite.position.x.toFixed(2)}, {satellite.position.y.toFixed(2)}, {satellite.position.z.toFixed(2)}) km</p>
                <p>Last Updated: {new Date(satellite.lastUpdated).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
