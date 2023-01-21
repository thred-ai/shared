import { App } from "thred-core"


export class Category{

  name!: string
  id!: string
  apps!: App[]
  cols!: number

  constructor(name: string, id: string, apps: App[], cols: number){
    this.name = name ?? "New"
    this.id = id
    this.apps = apps ?? []
    this.cols = cols ?? 3
  }
}