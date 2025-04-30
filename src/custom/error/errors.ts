export class InvalidRangeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidRangeError';
    };
};

export class VideoNotFoundError extends Error {
    constructor() {
        super('Video not found');
        this.name = 'VideoNotFoundError';
    };
};

export class InvalidFileTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidFileTypeError';
    };
};
