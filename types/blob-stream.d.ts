declare module 'blob-stream' {
  function blobStream(): NodeJS.WritableStream & {
    toBlob(type?: string): Blob;
  };
  export default blobStream;
} 