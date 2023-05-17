import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ForgotPassword } from "./forgot-password.entity";
import { v4 as uuid } from "uuid";
import * as crypto from "crypto";

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(ForgotPassword)
    private forgotRepository: Repository<ForgotPassword>,
  ) {}

  async saveForgetness(email: string, token: string) {
    try {
      const newId = uuid();

      const algorithm = "camellia-192-cbc";
      const key = crypto.scryptSync(newId, "salt", 24);

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encrypted = cipher.update(token, "utf8", "hex") + cipher.final("hex");
      //check if exists there
      const existence = await this.forgotRepository.find({ where: { email: email } });

      if (existence.length === 0) {
        const result = await this.forgotRepository.save({
          id: newId,
          tokenHash: encrypted,
          email: email,
          iv: iv,
        });

        if (result) {
          return [true, newId];
        }

        return [false];
      } else {
        await this.forgotRepository.update(
          { email: email },
          {
            id: newId,
            tokenHash: encrypted,
            email: email,
            iv: iv,
          },
        );

        return [true, newId];
      }
    } catch (e) {
      return [false];
    }
  }

  async findById(id: string) {
    return await this.forgotRepository.findOneBy({ id: parseInt(id) });
  }

  async deleteForgetness(email: string) {
    const existence = await this.forgotRepository.findOne({ where: { email: email } });

    if (existence) {
      return await this.forgotRepository.delete({ email: email });
    }

    return true;
  }
}
