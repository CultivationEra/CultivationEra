/*
 * Copyright (C) 2020 tswow <https://github.com/tswow/>
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

/* tslint:disable */
import { int } from '../../primitives'
import { Relation } from '../../query/Relations'
import { PrimaryKey } from '../../table/PrimaryKey'
import { DBCIntArrayCell, DBCIntCell, DBCKeyCell } from '../DBCCell'
import { DBCFile } from '../DBCFile'
import { DBCRow } from '../DBCRow'

 /**
  * Main row definition
  * - Add column comments to the commented getters below
  * - Add file comments to DBCFiles.ts
  */
export class CinematicSequencesRow extends DBCRow<CinematicSequencesCreator,CinematicSequencesQuery> {
    /**
     * Primary Key
     *
     * No comment (yet!)
     */
    @PrimaryKey()
    get ID() { return new DBCKeyCell(this,this.buffer,this.offset+0)}

    /**
     * No comment (yet!)
     */
    get SoundID() { return new DBCIntCell(this,this.buffer,this.offset+4)}

    /**
     * No comment (yet!)
     */
    get Camera() { return new DBCIntArrayCell(this,8,this.buffer,this.offset+8)}

    /**
     * Creates a clone of this row with new primary keys.
     *
     * Cloned rows are automatically added at the end of the DBC file.
     */
    clone(ID : int, c? : CinematicSequencesCreator) : this {
        return this.cloneInternal([ID],c);
    }
}

/**
 * Used for object creation (Don't comment these)
 */
export type CinematicSequencesCreator = {
    SoundID?: int
    Camera?: int[]
}

/**
 * Used for queries (Don't comment these)
 */
export type CinematicSequencesQuery = {
    ID? : Relation<int>
    SoundID? : Relation<int>
    Camera? : Relation<int>
}

/**
 * Table definition (specifies arguments to 'add' function)
 * - Add file comments to DBCFiles.ts
 */
export class CinematicSequencesDBCFile extends DBCFile<
    CinematicSequencesCreator,
    CinematicSequencesQuery,
    CinematicSequencesRow> {
    add(ID : int, c? : CinematicSequencesCreator) : CinematicSequencesRow {
        return this.makeRow(0).clone(ID,c)
    }
    findById(id: number) {
        return this.fastSearch(id);
    }
}

/**
 * Table singleton (Object used by 'DBC' namespace)
 * - Add file comments to DBCFiles.ts
 */
export const DBC_CinematicSequences = new CinematicSequencesDBCFile(
    'CinematicSequences',
    (table,buffer,offset)=>new CinematicSequencesRow(table,buffer,offset))
