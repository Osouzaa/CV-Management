import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import TypeOrmModuleAsyncOptions from './database.config'

@Module({
    imports:[TypeOrmModule.forRootAsync(TypeOrmModuleAsyncOptions)],
})

export class DatabaseModule {} 