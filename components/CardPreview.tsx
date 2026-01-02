"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getFactionColorClasses, getSourceBadgeClasses, formatFactionName } from "@/utils/diceDisplay";
import { sanitizeImageUrl } from "@/utils/dataFetcher";

type CardType = "ship" | "squadron" | "upgrade" | "objective";

interface BaseCardPreviewProps {
  className?: string;
}

interface ShipCardPreviewProps extends BaseCardPreviewProps {
  type: "ship";
  id: string;
  chassisId: string;
  name: string;
  faction: string;
  points: number;
  size?: string;
  hull?: number;
  cardimage?: string;
  source?: string;
}

interface SquadronCardPreviewProps extends BaseCardPreviewProps {
  type: "squadron";
  id: string;
  name: string;
  aceName?: string;
  faction: string;
  points: number;
  hull?: number;
  speed?: number;
  unique?: boolean;
  cardimage?: string;
  source?: string;
}

interface UpgradeCardPreviewProps extends BaseCardPreviewProps {
  type: "upgrade";
  id: string;
  name: string;
  upgradeType: string;
  faction: string[];
  points: number;
  unique?: boolean;
  modification?: boolean;
  ability?: string;
  cardimage?: string;
  source?: string;
}

interface ObjectiveCardPreviewProps extends BaseCardPreviewProps {
  type: "objective";
  id: string;
  name: string;
  objectiveType: string;
  specialRule?: string;
  cardimage?: string;
  source?: string;
}

type CardPreviewProps =
  | ShipCardPreviewProps
  | SquadronCardPreviewProps
  | UpgradeCardPreviewProps
  | ObjectiveCardPreviewProps;

function getCardLink(props: CardPreviewProps): string {
  switch (props.type) {
    case "ship":
      return `/ships/${props.chassisId}/${props.id}`;
    case "squadron":
      return `/squadrons/${props.id}`;
    case "upgrade":
      return `/upgrades/${props.id}`;
    case "objective":
      return `/objectives/${props.id}`;
  }
}

function getPrimaryFaction(props: CardPreviewProps): string {
  switch (props.type) {
    case "ship":
    case "squadron":
      return props.faction;
    case "upgrade":
      return props.faction[0] || "neutral";
    case "objective":
      return "neutral";
  }
}

export function CardPreview(props: CardPreviewProps) {
  const { className } = props;
  const faction = getPrimaryFaction(props);
  const factionColors = getFactionColorClasses(faction);
  const link = getCardLink(props);

  const cardImage = (() => {
    switch (props.type) {
      case "ship":
      case "squadron":
      case "upgrade":
      case "objective":
        return props.cardimage;
    }
  })();

  const source = (() => {
    switch (props.type) {
      case "ship":
      case "squadron":
      case "upgrade":
      case "objective":
        return props.source;
    }
  })();

  return (
    <Link
      href={link}
      className={cn(
        "group block rounded-lg border-2 bg-card overflow-hidden card-hover",
        factionColors.border,
        className
      )}
    >
      {/* Image thumbnail */}
      {cardImage && (
        <div className="relative h-32 w-full overflow-hidden bg-muted">
          <img
            src={sanitizeImageUrl(cardImage)}
            alt={props.name}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Card content */}
      <div className="p-3 space-y-2">
        {/* Header with name and points */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">
            {props.type === "squadron" && props.aceName
              ? `${props.aceName} - ${props.name}`
              : props.name}
          </h3>
          {props.type !== "objective" && (
            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", factionColors.bg, "text-white")}>
              {props.points}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-1.5">
          {/* Type-specific stats */}
          {props.type === "ship" && (
            <>
              {props.size && (
                <Badge variant="secondary" className="text-xs">
                  {props.size}
                </Badge>
              )}
              {props.hull && (
                <Badge variant="outline" className="text-xs">
                  Hull {props.hull}
                </Badge>
              )}
            </>
          )}

          {props.type === "squadron" && (
            <>
              {props.unique && (
                <Badge variant="secondary" className="text-xs">
                  Unique
                </Badge>
              )}
              {props.hull && (
                <Badge variant="outline" className="text-xs">
                  Hull {props.hull}
                </Badge>
              )}
              {props.speed && (
                <Badge variant="outline" className="text-xs">
                  Speed {props.speed}
                </Badge>
              )}
            </>
          )}

          {props.type === "upgrade" && (
            <>
              <Badge variant="secondary" className="text-xs capitalize">
                {props.upgradeType.replace(/-/g, " ")}
              </Badge>
              {props.unique && (
                <Badge variant="outline" className="text-xs">
                  Unique
                </Badge>
              )}
              {props.modification && (
                <Badge variant="outline" className="text-xs">
                  Mod
                </Badge>
              )}
            </>
          )}

          {props.type === "objective" && (
            <Badge variant="secondary" className="text-xs capitalize">
              {props.objectiveType}
            </Badge>
          )}
        </div>

        {/* Faction badge */}
        {props.type !== "objective" && faction !== "neutral" && (
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", factionColors.bg)} />
            <span className="text-xs text-muted-foreground">
              {props.type === "upgrade" && props.faction.length > 1
                ? props.faction.map(f => formatFactionName(f)).join(", ")
                : formatFactionName(faction)}
            </span>
          </div>
        )}

        {/* Source badge */}
        {source && (
          <Badge className={cn("text-xs", getSourceBadgeClasses(source))}>
            {source}
          </Badge>
        )}

        {/* Ability preview for upgrades */}
        {props.type === "upgrade" && props.ability && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {props.ability}
          </p>
        )}

        {/* Special rule preview for objectives */}
        {props.type === "objective" && props.specialRule && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {props.specialRule}
          </p>
        )}
      </div>
    </Link>
  );
}
