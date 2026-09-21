export type WorkplaceDTO = {
  wp_id: number;
  wp_name_th: string;
  wp_name_en: string;
};

export type WorkplaceListResponse = {
  data: WorkplaceDTO[];
};
