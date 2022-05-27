import fs from 'fs'
import logger from './logger'
import config from '../config'
import sqlite3 from 'sqlite3'

/**
 * sqlite3 数据库
 */
export const db = new sqlite3.Database(config.DB_FILAE_NAME);
