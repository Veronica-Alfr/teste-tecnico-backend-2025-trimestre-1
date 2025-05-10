interface FileTypeResult {
  mime: string;
};

export interface FileTypeModule {
  fromBuffer(buffer: Buffer): Promise<FileTypeResult | undefined>;
};
