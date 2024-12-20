export interface Screen {
  id: string;
  title?: string;
  image: {
    url: string;
  };
  platform?: Array<{
    name: string;
  }>;
  flowType?: {
    name: string;
  };
}

export interface App {
  id: string;
  name: string;
  category: string;
  description?: string;
  screens: Screen[];
  logo?: {
    url: string;
  };
  flowTypes?: Array<{
    name: string;
  }>;
}
