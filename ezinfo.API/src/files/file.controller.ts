import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
  Delete,
  UseGuards,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileService } from "./file.service";
import JwtAuthGuard from "src/auth/jwt-auth.guard";
import { RequestWithUser } from "src/auth/request-user.interface";
import { RealIP } from "nestjs-real-ip";
import { Response } from "express";
import { DeleteItemQuery } from "src/types/deleteItemQuery";
import { DeleteItemResponse } from "src/types/deleteItemResponse";
import { FileInfo } from "../types/item/fileInfo";

@Controller("file")
export class FileController {
  private static readonly UPLOAD_FILE_MAX_SIZE: number = 2 ** 23;
  constructor(private readonly fileServ: FileService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Req() request: RequestWithUser & FileInfo,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: FileController.UPLOAD_FILE_MAX_SIZE })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.fileServ.uploadFile(file.buffer, file.originalname, request.user, (request.body as unknown) as FileInfo);
    return { reached: true, result: result };
  }

  @Get("files")
  @UseGuards(JwtAuthGuard)
  async retrieveAllFiles(@Req() request: RequestWithUser, @RealIP() ip: string) {
    return this.fileServ.retrieveAllFiles(request.user);
  }

  @Get("download")
  @UseGuards(JwtAuthGuard)
  async downloadFile(@Query() query: { itemId: string; password: any }, @Req() request: RequestWithUser, @Res() res: Response) {
    const file = await this.fileServ.downloadFile(query.itemId, query.password, request.user);
    return file.pipe(res);
  }

  @Post("save")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async saveText(@Req() request: RequestWithUser) {
    return this.fileServ.saveText(request.body, request.user);
  }

  @Get("note")
  @UseGuards(JwtAuthGuard)
  async retrieveNote(@Query() query: any, @Req() request: RequestWithUser) {
    return this.fileServ.retrieveNote(query.id, query.password, request.user);
  }

  @Get("notes")
  @UseGuards(JwtAuthGuard)
  async retrieveAllNotes(@Query() query: any, @Req() request: RequestWithUser) {
    return this.fileServ.retrieveAllNotes(request.user);
  }

  @Delete("delete")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteItem(@Query() deleteItemQuery: DeleteItemQuery, @Req() request: RequestWithUser): Promise<DeleteItemResponse> {
    return this.fileServ.deleteItem(deleteItemQuery.code, deleteItemQuery.itemId, request.user);
  }
}
