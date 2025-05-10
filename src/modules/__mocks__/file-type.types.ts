export interface FileTypeResult {
  mime: string;
}

export interface FileTypeModule {
  fromBuffer: jest.MockedFunction<
    (buffer: Buffer) => Promise<FileTypeResult | undefined>
  >;
} 