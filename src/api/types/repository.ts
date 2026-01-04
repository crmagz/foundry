export type RepositoryInput = {
  token: string;
  name: string;
  description: string;
  private: boolean;
  template?: string;
  organization?: string;
  autoInit: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
};

export type RepositoryResult = {
  id: number;
  full_name: string;
  html_url: string;
};
