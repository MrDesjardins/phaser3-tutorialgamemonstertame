export interface Context {}

export interface State {
  name: string;
  onEnter: () => void;
}

export class StateMachine {
  private id: string;
  private context: Context | undefined;
  private states: Map<string, State> = new Map();
  private currentState: State | undefined;
  private isChangingState: boolean = false;
  private changingStateQueue: string[] = [];
  public constructor(id: string, context: Context | undefined) {
    this.id = id;
    this.context = context;
  }

  public get currentStateName(): string | undefined {
    return this.currentState?.name;
  }

  public update(): void {
    if (this.changingStateQueue.length > 0) {
      this.isChangingState = true;
      const nextState = this.changingStateQueue.shift();
      if (nextState) {
        this.setState(nextState);
      }
    }
  }

  public setState(name: string): void {
    const methodName = "setState";
    if (!this.states.has(name)) {
      console.warn(
        `[${StateMachine.name}-${this.id}:${methodName}] State ${name} does not exist`
      );
      return;
    }

    if (this.isCurrentState(name)) {
      return;
    }

    if (this.isChangingState) {
      this.changingStateQueue.push(name);
      return;
    }

    this.isChangingState = true;
    console.log(
      `[${StateMachine.name}-${this.id}:${methodName}] change from ${
        this.currentState?.name ?? "None"
      } to ${name}`
    );
    this.currentState = this.states.get(name);

    if (this.currentState?.onEnter) {
      this.currentState.onEnter();
    }

    this.isChangingState = false;
    console.log(
      `[${StateMachine.name}-${this.id}:${methodName}] ${this.currentState?.name} on enter invoked`
    );
  }

  public addState(state: State): void {
    this.states.set(state.name, {
      name: state.name,
      onEnter: this.context ? state.onEnter?.bind(this.context) : state.onEnter,
    });
  }

  private isCurrentState(name: string): boolean {
    if (!this.currentState) {
      return false;
    }
    return this.currentState.name === name;
  }
}
