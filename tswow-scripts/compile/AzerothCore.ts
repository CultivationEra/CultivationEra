/*
 * This file is part of tswow (https://github.com/tswow)
 *
 * Copyright (C) 2022 tswow <https://github.com/tswow/>
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { BuildType } from "../util/BuildType";
import { wfs } from "../util/FileSystem";
import { ipaths } from "../util/Paths";
import { isWindows } from "../util/Platform";
import { wsys } from "../util/System";
import { term } from "../util/Terminal";
import { copyExtLibs } from "./CommonCore";
import { bpaths, spaths } from "./CompilePaths";
import { TrinityCore } from "./TrinityCore";

export namespace AzerothCore {
    export async function install(cmake: string, openssl: string, mysql: string, type: BuildType, args1: string[]) {
        term.log('build','Building AzerothCore');
        bpaths.AzerothCore.mkdir()
        const generateOnly = args1.includes('--generate-only')
        if(!args1.includes('--no-compile') && !process.argv.includes('no-compile-ac')) {
            if(isWindows()) {
                wsys.exec(
                    `${cmake} `
                  + ` -DCMAKE_GENERATOR="Visual Studio 16 2019"`
                  + ` -DMYSQL_INCLUDE_DIR="${mysql}/include"`
                  + ` -DMYSQL_LIBRARY="${mysql}/lib/libmysql.lib"`
                  + ` -DOPENSSL_INCLUDE_DIR="${wfs.absPath(openssl)}/include"`
                  + ` -DOPENSSL_ROOT_DIR="${wfs.absPath(openssl)}"`
                  + ` -DBOOST_ROOT="${bpaths.boost.boost_1_74_0.abs().get()}"`
                  + ` -DTOOLS=ON`
                  + ` -S "${spaths.cores.AzerothCore.get()}"`
                  + ` -B "${bpaths.AzerothCore.get()}"`
                  , 'inherit');
                if(generateOnly) return;

                // Doesn't work, you need to open it manually in visual studio and then run this again.

                /*
                wsys.exec(
                        `${cmake}`
                      + ` --build ${bpaths.AzerothCore.get()}`
                      + ` --config ${type}`
                    , 'inherit'
                );
                */
            }
        }

        // build sql
        const sqlRoot = spaths.cores.AzerothCore.data.sql;
        ipaths.bin.sql_ac.remove();
        ['base','updates','custom'].forEach(type=>{
            sqlRoot.type.pick(type).db_auth.iterateDef(node=>{
                ipaths.bin.sql_ac.db_auth.append(node.toFile().readString());
            })
            sqlRoot.type.pick(type).db_characters.iterateDef(node=>{
                ipaths.bin.sql_ac.db_characters.append(node.toFile().readString());
            })
            sqlRoot.type.pick(type).db_world.iterateDef(node=>{
                ipaths.bin.sql_ac.db_world.append(node.toFile().readString());
            })
        })
        copyExtLibs('azerothcore',type)
        const rev = wsys.execIn(
              spaths.cores.AzerothCore.get()
            , 'git rev-parse HEAD','pipe').split('\n').join('');
        ipaths.bin.revisions.azerothcore.write(rev)

        bpaths.AzerothCore.bin.join(type).copy(ipaths.bin.core.pick('azerothcore').join(type))
        bpaths.AzerothCore.libraries(type).forEach(x=>x.copy(ipaths.bin.libraries_ac.build.pick(type).join(x.basename())));

        // note: will use tc enums when building, some might be incorrect.
        TrinityCore.headers();
    }
}