import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); //DELETE * FROM Pokemons
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    //#region Primera Opcion Insercion con Await
    // data.results.forEach(async ({ name, url }) => {
    //   const segments = url.split('/');
    //   const no: number = +segments[segments.length - 2];
    //   const pokemon = await this.pokemonModel.create({ name, no });
    // });
    //#endregion

    //#region Segunda Opcion Insercion Simultanea
    // const insertPromisesArray = [];
    // data.results.forEach(({ name, url }) => {
    //   const segments = url.split('/');
    //   const no: number = +segments[segments.length - 2];
    //   insertPromisesArray.push(this.pokemonModel.create({ name, no }));
    // });
    // await Promise.all(insertPromisesArray);
    //#endregion

    //#region Tercera Opcion Insercion Simultanea
    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });
    });
    const pokemon = await this.pokemonModel.insertMany(pokemonToInsert); // INSERT INTO Pokemons (name, no) VALUES (name, no), (name, no)
    //#endregion
    return 'Seed Executed';
  }
}
