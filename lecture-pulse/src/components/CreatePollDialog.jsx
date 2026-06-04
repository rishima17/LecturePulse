import { useState } from "react";

function CreatePollDialog({ onSubmit, onClose }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => setOptions([...options, ""]);

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = () => {
    if (!question || options.some(o => !o)) return;
    onSubmit({
      id: Date.now(),
      question,
      options: options.map(label => ({ label, votes: 0 })),
      active: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Create Poll</h2>
        <input
          className="w-full bg-white/10 rounded p-2 mb-3"
          placeholder="Your question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        {options.map((opt, i) => (
          <input
            key={i}
            className="w-full bg-white/10 rounded p-2 mb-2"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={e => updateOption(i, e.target.value)}
          />
        ))}
        <button onClick={addOption} 
          className="text-purple-400 text-sm mb-4">
          + Add Option
        </button>
        <div className="flex gap-2">
          <button onClick={handleSubmit}
            className="flex-1 bg-purple-600 rounded p-2">
            Launch Poll
          </button>
          <button onClick={onClose}
            className="flex-1 bg-white/10 rounded p-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePollDialog;