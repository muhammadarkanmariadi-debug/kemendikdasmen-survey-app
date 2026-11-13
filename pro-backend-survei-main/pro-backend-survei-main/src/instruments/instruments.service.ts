import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { QueryInstrumentDto } from './dto/query-instrument.dto';
import { parsePagination } from 'src/helper/pagination';
import { parse } from 'path';

type IJenisResponden = {
  id: number
  uuid: string
  jenis: string
  is_public: boolean
  tipe: "SEKOLAH" | "DINAS"
  createdAt: string
  updatedAt: string
}

@Injectable()
export class InstrumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService
  ) { }

  parseRespondenGroup = (data: string): IJenisResponden[] => {
    try {
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }

  async create(createInstrumentDto: CreateInstrumentDto) {
    try {
      let { id_kategori, kategori, pertanyaan, jenis, required, id_survey, opsi, for_responden_group, order_index, deskripsi_bantuan, for_sub_role, file_config, scale_config } = createInstrumentDto

      if (!kategori && id_kategori) {
        const cat = await this.prisma.kategori.findFirst({ where: { uuid: id_kategori } });
        kategori = cat?.nama_kategori || 'Umum';
      } else if (!kategori) {
        kategori = 'Umum';
      }

      if (!for_responden_group) {
        for_responden_group = '["SEMUA"]';
      }

      const createInstrument = await this.prisma.pertanyaan.create({
        data: {
          uuid: this.uuid.generateUUID(),
          id_kategori,
          kategori,
          pertanyaan,
          jenis,
          required,
          id_survey,
          for_responden_group,
          order_index: order_index ?? 0,
          deskripsi_bantuan: deskripsi_bantuan || "",
          for_sub_role: for_sub_role || '["SISWA","GURU","KEPALA_SEKOLAH"]',
          file_config: file_config || "{}",
          scale_config: scale_config || "{}"
        }
      })

      const hasOptions = ['PILIHAN', 'CHECKBOX', 'PILIHAN_GANDA', 'KOTAK_CENTANG', 'DROPDOWN'].includes(jenis);
      if (hasOptions && opsi?.length) {
        let optIdx = 0;
        for (const item of opsi) {
          await this.prisma.opsi_pertanyaan.create({
            data: {
              uuid: this.uuid.generateUUID(),
              id_pertanyaan: createInstrument.uuid,
              opsi_jawaban: item.opsi_jawaban,
              ada_catatan: item.ada_catatan,
              keterangan_catatan: item.keterangan_catatan || "",
              order_index: item.order_index ?? optIdx,
              goto_kategori_uuid: item.goto_kategori_uuid || "",
            },
          });
          optIdx++;
        }
      }
      return {
        success: true,
        message: 'Instrument created successfully',
        data: createInstrument
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findAll(query: QueryInstrumentDto) {
    try {
      const { take, skip, page, quantity } = parsePagination(query);
      const search = query.search?.trim();
      const id_survey = query.id_survey;

      const whereCondition: any = {
        ...(id_survey ? { id_survey } : {}),
        ...(search ? {
          OR: [
            { kategori: { contains: search, mode: 'insensitive' } },
            { pertanyaan: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const findInstrument = await this.prisma.pertanyaan.findMany({
        take,
        skip,
        where: whereCondition,
        orderBy: { order_index: 'asc' },
        include: {
          opsi_pertanyaan: true
        },
      });

      const totalInstrument = await this.prisma.pertanyaan.count({
        where: whereCondition
      });

      return {
        success: true,
        message: 'Instrument found successfully',
        data: findInstrument.map(instrument => {
          return {
            ...instrument,
            for_responden_group: this.parseRespondenGroup(instrument.for_responden_group)
          }
        }),
        meta: {
          page: page ?? 1,
          quantity: quantity ?? totalInstrument,
          totalData: totalInstrument
        }
      }

    } catch (error) {
      console.error('Error in instruments.findAll:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const findInstrument = await this.prisma.pertanyaan.findFirst({
        where: {
          uuid: id
        },
        include: {
          opsi_pertanyaan: true
        },
      })
      if (!findInstrument) {
        return {
          success: true,
          message: 'Instrument does not exists',
          data: null
        }
      }

      return {
        success: true,
        message: 'Instrument found successfully',
        data: {
          ...findInstrument,
          for_responden_group: this.parseRespondenGroup(findInstrument.for_responden_group)
        }
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async update(id: string, updateInstrumentDto: UpdateInstrumentDto) {
    try {
      const { id_kategori, kategori, pertanyaan, jenis, required, id_survey, opsi, for_responden_group, order_index, deskripsi_bantuan, for_sub_role, file_config, scale_config } = updateInstrumentDto
      const findInstrument = await this.prisma.pertanyaan.findFirst({
        where: {
          uuid: id
        }
      })
      if (!findInstrument) {
        return {
          success: true,
          message: 'Instrument does not exists',
          data: null
        }
      }

      const updatedInstrument = await this.prisma.pertanyaan.update({
        where: {
          uuid: id
        },
        data: {
          id_kategori: id_kategori ?? findInstrument.id_kategori,
          kategori: kategori ?? findInstrument.kategori,
          pertanyaan: pertanyaan ?? findInstrument.pertanyaan,
          jenis: jenis ?? findInstrument.jenis,
          required: required ?? findInstrument.required,
          id_survey: id_survey ?? findInstrument.id_survey,
          for_responden_group: for_responden_group ?? findInstrument.for_responden_group,
          order_index: order_index ?? findInstrument.order_index,
          deskripsi_bantuan: deskripsi_bantuan ?? findInstrument.deskripsi_bantuan,
          for_sub_role: for_sub_role ?? findInstrument.for_sub_role,
          file_config: file_config ?? findInstrument.file_config,
          scale_config: scale_config ?? findInstrument.scale_config,
        }
      })

      const hasOptions = ['PILIHAN', 'CHECKBOX', 'PILIHAN_GANDA', 'KOTAK_CENTANG', 'DROPDOWN'].includes(jenis ?? findInstrument.jenis);
      if (hasOptions && opsi) {
        // Hapus semua opsi lama
        await this.prisma.opsi_pertanyaan.deleteMany({
          where: { id_pertanyaan: id },
        });
        let optIdx = 0;
        for (const item of opsi) {
          await this.prisma.opsi_pertanyaan.create({
            data: {
              uuid: this.uuid.generateUUID(),
              id_pertanyaan: id,
              opsi_jawaban: item.opsi_jawaban,
              ada_catatan: item.ada_catatan,
              keterangan_catatan: item.keterangan_catatan || "",
              order_index: item.order_index ?? optIdx,
              goto_kategori_uuid: item.goto_kategori_uuid || "",
            },
          });
          optIdx++;
        }
      }
      return {
        success: true,
        message: 'Instrument updated successfully',
        data: updatedInstrument,
        length_opsi: opsi?.length || 0,
        jenis,
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async reorder(reorderDto: { id_survey: string; items: { uuid: string; order_index: number; id_kategori?: string }[] }) {
    try {
      const { items } = reorderDto;
      const updates = items.map((item) =>
        this.prisma.pertanyaan.update({
          where: { uuid: item.uuid },
          data: {
            order_index: item.order_index,
            ...(item.id_kategori ? { id_kategori: item.id_kategori } : {}),
          },
        }),
      );
      await this.prisma.$transaction(updates);
      return {
        success: true,
        message: 'Instruments reordered successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to reorder instruments: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const findInstrument = await this.prisma.pertanyaan.findFirst({
        where: {
          uuid: id
        }
      })
      if (!findInstrument) {
        return {
          success: false,
          message: 'Instrument does not exists',
          data: null
        }
      }

      const isAnswered = await this.prisma.hasil_survey.findFirst({
        where: {
          id_survey: findInstrument.id_survey,
        },
      });

      if (isAnswered) {
        return {
          success: false,
          message: 'Instrument has been answered, cannot be deleted',
          data: null,
        };
      }

      if (findInstrument.jenis !== 'ISIAN') {
        // Hapus semua opsi lama
        await this.prisma.opsi_pertanyaan.deleteMany({
          where: { id_pertanyaan: id },
        });
      }

      const deletedInstrument = await this.prisma.pertanyaan.delete({
        where: {
          uuid: id
        }
      });

      return {
        success: true,
        message: 'Instrument deleted successfully',
        data: deletedInstrument
      }

    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async showAllInstruments(id_survey: string) {
    try {
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          uuid: id_survey
        }
      })
      if (!findSurvey) {
        return {
          success: false,
          message: 'Survey does not exists',
          data: null,
        };
      }

      const dataInstrument = await this.prisma.kategori.findMany({
        where: {
          id_survey: findSurvey.uuid,
        },
        orderBy: { order_index: 'asc' },
        include: {
          pertanyaan: {
            orderBy: { order_index: 'asc' },
            include: {
              opsi_pertanyaan: {
                orderBy: { order_index: 'asc' },
              },
              target_rules: true,
              source_rules: true,
            },
          },
        },
      });

      const parsedDataInstrument = dataInstrument.map((kategori) => {
        return {
          ...kategori,
          pertanyaan: kategori.pertanyaan.map((pertanyaan) => {
            return {
              ...pertanyaan,
              for_responden_group: this.parseRespondenGroup(pertanyaan.for_responden_group)
            }
          })
        }
      })

      return {
        success: true,
        message: 'All Instruments found successfully',
        data: parsedDataInstrument,
      }

    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }
}
