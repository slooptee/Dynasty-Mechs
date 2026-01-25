export class Pilot {
  constructor({ name, description, ability }) {
    this.name = name;
    this.description = description;
    this.ability = ability; // A function that takes a bot and modifies it
  }
}
