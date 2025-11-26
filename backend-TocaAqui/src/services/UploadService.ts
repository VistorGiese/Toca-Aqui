import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';


class UploadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`Diretório de uploads criado: ${this.uploadDir}`);
    }
  }


  private storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      cb(null, this.uploadDir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      const uniqueId = uuidv4();
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${uniqueId}-${timestamp}${ext}`;
      
      console.log(`Upload: ${file.originalname} → ${filename}`);
      cb(null, filename);
    }
  });


  private fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ): void => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${ext}. Use: ${allowedExtensions.join(', ')}`));
    }
  };


  public uploadSingle = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB em bytes
    }
  }).single('imagem'); // 


  public uploadMultiple = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 
      files: 5 
    }
  }).array('imagens', 5);


  public deleteFile(filepath: string): boolean {
    try {
      const absolutePath = path.isAbsolute(filepath) 
        ? filepath 
        : path.join(__dirname, '../../', filepath);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        console.log(`Arquivo deletado: ${filepath}`);
        return true;
      } else {
        console.warn(`Arquivo não encontrado para deletar: ${filepath}`);
        return false;
      }
    } catch (error) {
      console.error(`Erro ao deletar arquivo ${filepath}:`, error);
      return false;
    }
  }


  public getRelativePath(file: Express.Multer.File): string {
    return `uploads/${file.filename}`;
  }


  public fileExists(filepath: string): boolean {
    const absolutePath = path.isAbsolute(filepath) 
      ? filepath 
      : path.join(__dirname, '../../', filepath);
    
    return fs.existsSync(absolutePath);
  }


  public getFileInfo(filepath: string): { size: number; created: Date } | null {
    try {
      const absolutePath = path.isAbsolute(filepath) 
        ? filepath 
        : path.join(__dirname, '../../', filepath);
      
      if (fs.existsSync(absolutePath)) {
        const stats = fs.statSync(absolutePath);
        return {
          size: stats.size,
          created: stats.birthtime
        };
      }
      return null;
    } catch (error) {
      console.error(`Erro ao obter info do arquivo ${filepath}:`, error);
      return null;
    }
  }
}

export const uploadService = new UploadService();
