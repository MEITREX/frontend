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

export type CourseLeaderboardProps = {
  courseId: string;
  currentUserId: string;
  title?: string;
  periodLabel?: string;
  onPrevious?: () => void;
  // ggf. weitere Props
};

const CourseLeaderboard: React.FC<CourseLeaderboardProps> = ({
  courseId,
  currentUserId,
  title = "Leaderboard",
  periodLabel,
  onPrevious,
}) => {
  // TODO: Lade hier die User basierend auf courseId per GraphQL, REST, etc.
  const users: User[] = []; // Beispiel: API call machen, useQuery benutzen, etc.

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
            style={{
              fontWeight: user.id === currentUserId ? "bold" : "normal",
            }}
          >
            #{user.rank} {user.name} - {user.points} pts
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseLeaderboard;
