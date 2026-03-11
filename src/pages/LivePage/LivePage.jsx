import { useParams } from "react-router-dom";

const LivePage = () => {
  const { gameId } = useParams();

  return (
    <div>
      <h1>Live Page</h1>
      <p>문자중계 + 실시간 댓글 페이지입니다. Game ID: {gameId}</p>
    </div>
  );
};

export default LivePage;
