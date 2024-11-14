
export type ExportItem = {
  id: string | undefined;
  content: string | undefined;
  // Option<DateTime<Utc>> -> should be jackson date
  date: string | undefined;
};

export interface Connector<State, Settings> {
  get(state: State): Promise<{ result: ExportItem[]; state: State }>;
  // static async create<State, Settings>(settings: string): Promise<Connector<State, Settings>> {
  //     throw new Error('Method not implemented! Use derived class');
  // }
}
