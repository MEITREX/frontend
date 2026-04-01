import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import logo from "@/assets/logo.svg";
import { getUnlockedItemAndEquiped } from "@/components/items/logic/GetItems";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { Box } from "@mui/material";
import Image from "next/image";
import { useAuth } from "react-oidc-context";
import { useLazyLoadQuery } from "react-relay";

export default function TutorAvatar() {
  const auth = useAuth();
  const isGamificationDisabled =
    auth.user?.profile?.gamification_type === "none";

  const { inventoryForUser } =
    useLazyLoadQuery<WidgetApiItemInventoryForUserQuery>(
      widgetApiItemInventoryForUserQuery,
      {},
      { fetchPolicy: "store-or-network" }
    );

  let avatarProps;

  if (isGamificationDisabled) {
    avatarProps = {
      src: logo,
      alt: "Logo",
    };
  } else {
    const tutor = getUnlockedItemAndEquiped(inventoryForUser, "tutors");
    avatarProps = {
      src: tutor?.url ?? logo, // benutze tutor.url oder das Logo als Fallback
      alt: tutor?.name ?? "Tutor Avatar",
    };
  }
  return (
    <div className="avatar-container" draggable={false}>
      <Box width="80px" height="80px">
        <Image
          src={avatarProps.src as string}
          alt={avatarProps.alt as string}
          fill
          className="avatar-img"
          style={{ objectFit: "contain" }}
        />
      </Box>
      <style jsx>{`
        .avatar-container {
          display: inline-block;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          cursor: grab;
        }
        .avatar-container:active {
          cursor: grabbing;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .avatar-container:hover .avatar-img {
          animation: shake 0.5s;
          animation-iteration-count: 1;
        }
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-5px);
          }
          40% {
            transform: translateX(5px);
          }
          60% {
            transform: translateX(-5px);
          }
          80% {
            transform: translateX(5px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
