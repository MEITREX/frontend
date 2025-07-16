import React from "react";

export type User = {
  id: string;
  name: string;
  points: number;
  rank: number;
  profileImage: string;
  backgroundImage?: string;
  isCurrentUser?: boolean;
};

export type LeaderboardProps = {
  title: string;
  periodLabel?: string;
  onPrevious?: () => void;
  users: User[];
  // ggf. weitere Props
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  title,
  periodLabel,
  onPrevious,
  users,
}) => {
  return (
    <div>
      <h2>{title}</h2>
      {periodLabel && <p>{periodLabel}</p>}
      {onPrevious && (
        <button onClick={onPrevious} style={{ marginBottom: 10 }}>
          Previous
        </button>
      )}
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            style={{ fontWeight: user.isCurrentUser ? "bold" : "normal" }}
          >
            #{user.rank} {user.name} - {user.points} pts
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
