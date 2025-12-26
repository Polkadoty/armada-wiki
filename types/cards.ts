// Ship Types
export interface Ship {
  UID: string;
  type: 'chassis';
  chassis_name: string;
  size: string;
  hull: number;
  speed: {
    [key: string]: number[];
  };
  shields: {
    front: number;
    rear: number;
    left: number;
    right: number;
    left_aux?: number;
    right_aux?: number;
  };
  hull_zones?: {
    frontoffset: number;
    centeroffset: number;
    rearoffset: number;
    frontangle: number;
    centerangle: number;
    rearangle: number;
  };
  silhouette?: string;
  blueprint?: string;
  models: {
    [key: string]: ShipModel;
  };
  source?: string;
}

export interface ShipModel {
  UID: string;
  type: 'ship';
  chassis: string;
  name: string;
  faction: string;
  unique: boolean;
  traits?: string[];
  points: number;
  tokens: {
    def_scatter?: number;
    def_evade?: number;
    def_brace?: number;
    def_redirect?: number;
    def_contain?: number;
    def_salvo?: number;
  };
  values: {
    command: number;
    squadron: number;
    engineer: number;
  };
  upgrades: string[];
  armament: {
    [key: string]: number[];
  };
  artwork?: string;
  cardimage?: string;
  source?: string;
}

// Squadron Types
export interface Squadron {
  UID: string;
  type: 'squadron';
  faction: string;
  squadron_type?: string;
  name: string;
  'ace-name'?: string;
  'unique-class'?: string[];
  irregular?: boolean;
  hull: number;
  speed: number;
  tokens: {
    def_scatter?: number;
    def_evade?: number;
    def_brace?: number;
  };
  armament: {
    'anti-squadron': number[];
    'anti-ship': number[];
  };
  abilities?: {
    adept?: number;
    'ai-battery'?: number;
    'ai-antisquadron'?: number;
    assault?: boolean;
    bomber?: boolean;
    cloak?: boolean;
    counter?: number;
    dodge?: number;
    escort?: boolean;
    grit?: boolean;
    heavy?: boolean;
    intel?: boolean;
    relay?: number;
    rogue?: boolean;
    scout?: boolean;
    screen?: boolean;
    snipe?: number;
    strategic?: boolean;
    swarm?: boolean;
  };
  ability?: string;
  unique: boolean;
  points: number;
  silhouette?: string;
  artwork?: string;
  cardimage?: string;
  source?: string;
  rulings?: string;
}

// Upgrade Types
export interface Upgrade {
  UID: string;
  type: string;
  faction: string[];
  name: string;
  'unique-class'?: string[];
  ability: string;
  unique: boolean;
  points: number;
  modification?: boolean;
  bound_shiptype?: string;
  restrictions?: {
    traits?: string[];
    size?: string[];
    disqual_upgrades?: string[];
    disable_upgrades?: string[];
    flagship?: boolean;
  };
  start_command?: {
    type: string;
    start_icon?: string[];
    start_amount?: number;
  };
  exhaust?: {
    type: string;
    ready_token?: string[];
    ready_amount?: number;
  };
  artwork?: string;
  cardimage?: string;
  source?: string;
  rulings?: string;
}

// Objective Types
export interface Objective {
  _id: string;
  type: string;
  name: string;
  obstacles?: string[];
  setup?: string;
  special_rule?: string;
  end_of_round?: string;
  end_of_game?: string;
  victory_tokens?: boolean;
  victory_tokens_points?: number;
  objective_tokens?: boolean;
  objective_tokens_type?: string;
  objective_tokens_count?: number[];
  command_tokens?: boolean;
  command_tokens_type?: string;
  command_tokens_value?: string;
  command_tokens_count?: number;
  errata?: string;
  artwork?: string;
  cardimage?: string;
  source?: string;
}

// API Response Types
export interface ShipsResponse {
  ships: {
    [key: string]: Ship;
  };
}

export interface SquadronsResponse {
  squadrons: {
    [key: string]: Squadron;
  };
}

export interface UpgradesResponse {
  upgrades: {
    [key: string]: Upgrade;
  };
}

export interface ObjectivesResponse {
  objectives: {
    [key: string]: Objective;
  };
}
