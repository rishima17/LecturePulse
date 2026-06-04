import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

function PollCard({ poll, onVote, isTeacher }) {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);

  const handleVote = (option) => {
    if (voted) return;
    // Click same option = deselect, click different = change
    if (selected === option) {
      setSelected(null);
    } else {
      setSelected(option);
    }
  };

  const handleSubmit = () => {
    if (!selected || voted) return;
    setVoted(true);
    onVote(selected);
  };

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-3">{poll.question}</h3>

        {poll.options.map((option) => (
          <button
            key={option.label}
            onClick={() => handleVote(option.label)}
            disabled={voted}
            className={`w-full text-left p-3 mb-2 rounded-lg border transition-all
              ${selected === option.label
                ? "bg-purple-100 border-purple-500 font-medium"
                : "hover:bg-gray-50 border-gray-200"}
              ${voted ? "cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <span>{option.label}</span>
            {isTeacher && (
              <>
                <span className="float-right text-sm text-gray-500">
                  {option.votes} votes
                  {totalVotes > 0 &&
                    ` (${Math.round((option.votes / totalVotes) * 100)}%)`}
                </span>
                {totalVotes > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-purple-500 h-1 rounded-full"
                      style={{
                        width: `${Math.round((option.votes/totalVotes)*100)}%`
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </button>
        ))}

        {/* Submit only shows when an option is selected and not yet voted */}
        {!isTeacher && selected && !voted && (
          <button
            onClick={handleSubmit}
            className="w-full mt-2 p-2 rounded-lg bg-purple-600 
              hover:bg-purple-700 text-white font-medium"
          >
            Submit Vote
          </button>
        )}

        {voted && (
          <p className="text-green-600 text-sm mt-2">✅ Vote submitted!</p>
        )}
        <p className="text-xs text-gray-400 mt-2">Total votes: {totalVotes}</p>
      </CardContent>
    </Card>
  );
}

export default PollCard;