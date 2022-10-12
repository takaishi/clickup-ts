import * as dotenv from 'dotenv'
import { Command } from 'commander';
import {AppendGetCommands} from "./getCli";

dotenv.config()

const program = new Command()

AppendGetCommands(program)

program.parse(process.argv);
