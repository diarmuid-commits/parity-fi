import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
// @ts-ignore
import idl from '../../idl/parity.json';

const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');

export function getProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  return new Program(idl as any, PROGRAM_ID, provider);
}

export function getMarketPDA(creator: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('market'), creator.toBuffer()],
    programId
  );
}

export function getVaultPDA(market: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), market.toBuffer()],
    programId
  );
}

export function getPositionPDA(
  market: PublicKey,
  user: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('position'), market.toBuffer(), user.toBuffer()],
    programId
  );
}

