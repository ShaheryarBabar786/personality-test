import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PersonalityService {
  async getBigFive() {
    const filePath = path.join(__dirname, '../data/big-five.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  }
}
