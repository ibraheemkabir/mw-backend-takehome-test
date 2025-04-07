import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ProviderLogs {
  @PrimaryColumn({ length: 7 })
  vrm: string;

  @Column('datetime')
  requestDatetime: Date;

  @Column()
  requestDuration: string;

  @Column()
  requestUrl: string;

  @Column({ nullable: true })
  responseCode: number;

  @Column({ nullable: true })
  errorCode: number;

  @Column({ nullable: true })
  errorMessage: string;

  @Column()
  provider: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
