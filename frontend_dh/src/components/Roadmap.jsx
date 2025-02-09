import { useState } from 'react';
import { LoaderCircle, Award, CheckCircle } from 'lucide-react';

const RoadmapForm = ({ onSubmit, loading }) => (
  <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create Your Learning Roadmap</h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">
          Area of Interest
        </label>
        <input
          type="text"
          id="interest"
          name="interest"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="e.g., Python Programming"
        />
      </div>
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
          Experience Level
        </label>
        <select
          id="level"
          name="level"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:bg-blue-300 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" size={20} />
            Generating Roadmap...
          </>
        ) : (
          'Generate Roadmap'
        )}
      </button>
    </form>
  </div>
);

const TaskCard = ({ task, index }) => {
  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-semibold">
            {index}
          </span>
          <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[task.difficulty]}`}>
          {task.difficulty}
        </span>
      </div>
      <p className="text-gray-600">{task.description}</p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">{task.points} points</span>
        </div>
        {task.completed && (
          <CheckCircle size={20} className="text-green-500" />
        )}
      </div>
    </div>
  );
};

const RoadmapDisplay = ({ roadmap }) => (
  <div className="max-w-4xl mx-auto p-6 space-y-8">
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{roadmap.theme.name}</h1>
          <p className="text-gray-600">{roadmap.theme.description}</p>
        </div>
        <div className="flex gap-2">
          {roadmap.theme.icons.map((icon, index) => (
            <span key={index} className="text-2xl">{icon}</span>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Achievement Badges</h2>
        <div className="flex gap-4">
          {roadmap.theme.badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <Award size={20} className="text-blue-500" />
              <span className="text-sm font-medium text-blue-700">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Learning Path</h2>
      <div className="space-y-4">
        {roadmap.tasks.map((task, index) => (
          <TaskCard key={index} task={task} index={index + 1} />
        ))}
      </div>
    </div>
  </div>
);

const Roadmap = () => {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = {
      interest: e.target.interest.value,
      level: e.target.level.value
    };

    try {
      const response = await fetch('http://localhost:5000/api/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      setRoadmap(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {error && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      {!roadmap ? (
        <RoadmapForm onSubmit={handleSubmit} loading={loading} />
      ) : (
        <div className="container mx-auto px-4">
          <button
            onClick={() => setRoadmap(null)}
            className="mb-8 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Create New Roadmap
          </button>
          <RoadmapDisplay roadmap={roadmap} />
        </div>
      )}
    </div>
  );
};

export default Roadmap;