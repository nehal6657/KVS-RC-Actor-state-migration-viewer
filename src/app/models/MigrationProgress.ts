export interface MigrationProgressModel{
    status: number,
    currentPhase: number,
    startSeqNum: number,
    endSeqNum: number,
    lastAppliedSeqNum: number,
    phaseResults: PhaseResults
}

export interface PhaseResults{
    status: number,
    phase: number
}
