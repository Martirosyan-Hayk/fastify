import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  type ApplicantDto,
  ApplicantResumeDto,
  GeneratorProvider,
  type GetSignedUrlDto,
  type IFile,
  ImagePayloadDto,
  type IncognitoApplicantDto,
  invariant,
  ProfessionClientService,
  ResumeKeyPayloadDto,
  SearchCityClientService,
  SignedUrlDto,
  SkillClientService,
  SkillTypeEnum,
  SpecialtyClientService,
  UtilsProvider,
} from '@hr-drone/common-module';
import { Injectable } from '@nestjs/common';
import { encode } from 'blurhash';
import _ from 'lodash';
import mime from 'mime-types';
import sharp from 'sharp';

import { ApiConfigService } from './api-config.service';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;

  private readonly lambdaClient: LambdaClient;

  constructor(
    private configService: ApiConfigService,
    private skillsClientService: SkillClientService,
    private specialtyClientService: SpecialtyClientService,
    private professionClientService: ProfessionClientService,
    private searchCityClientService: SearchCityClientService,
  ) {
    const awsS3Config = configService.awsS3Config;

    this.s3Client = new S3Client({
      region: awsS3Config.region,
    });

    this.lambdaClient = new LambdaClient({
      region: awsS3Config.region,
    });
  }

  async uploadImage(file: IFile): Promise<ImagePayloadDto> {
    // FIXME add validation for image
    const fileName = GeneratorProvider.fileName(
      <string>mime.extension(file.mimetype),
    );

    const imageKey = `images/${fileName}`;

    console.info('starting blurhash encoding');

    const blurHash = await this.encodeImageToBlurhash(file.buffer);

    console.info('starting uploading encoding');

    const command = new PutObjectCommand({
      Bucket: this.configService.awsS3Config.bucketName,
      Key: imageKey,
      Body: file.buffer,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    return ImagePayloadDto.create({
      bucketName: this.configService.awsS3Config.bucketName,
      imageKey,
      blurHash,
    });
  }

  async encodeImageToBlurhash(originalBuffer: Buffer): Promise<string> {
    const { data, info } = await sharp(originalBuffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    return encode(
      new Uint8ClampedArray(data as Iterable<number>),
      info.width,
      info.height,
      4,
      4,
    );
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async generateResume(
    applicantDto: ApplicantDto | IncognitoApplicantDto,
  ): Promise<ResumeKeyPayloadDto> {
    const applicantDetails = applicantDto.details;

    invariant(applicantDetails, 'Applicant details is required');
    invariant(
      applicantDetails.professionId,
      'Applicant professionId is required',
    );
    invariant(
      applicantDetails.specialtyIds,
      'Applicant specialtyIds is required',
    );
    invariant(applicantDetails.skillIds, 'Applicant skillIds is required');
    invariant(applicantDetails.cityId, 'Applicant cityId is required');
    invariant(applicantDetails.level, 'Applicant level is required');

    let imageKey: string | null = null;

    if (applicantDto.avatar) {
      const cdnUrl = this.configService.appConfig.cdnUrl;
      imageKey = cdnUrl + '/512x512/' + applicantDto.avatar.imageKey;
    }

    const [profession, specialties, city, skills] = await Promise.all([
      this.professionClientService.getById(applicantDetails.professionId),
      this.specialtyClientService.getByIds(applicantDetails.specialtyIds),
      this.searchCityClientService.getOne(applicantDetails.cityId),
      this.skillsClientService.getByIds(applicantDetails.skillIds),
    ]);

    const softSkills: string[] = [];
    const hardSkills: string[] = [];

    for (const skill of skills.data) {
      if (skill.type === SkillTypeEnum.SOFT) {
        softSkills.push(skill.title);
      }

      if (skill.type === SkillTypeEnum.HARD) {
        hardSkills.push(skill.title);
      }
    }

    const level = _.capitalize(_.startCase(applicantDetails.level));

    const employmentTypes = _.map(
      applicantDetails.employmentTypes,
      (employmentType) => _.capitalize(_.startCase(employmentType)),
    );

    let englishLevel: string | null = null;

    if (applicantDetails.englishLevel) {
      englishLevel = _.capitalize(_.startCase(applicantDetails.englishLevel));
    }

    const applicantResumeDto = UtilsProvider.plainToInstance(
      ApplicantResumeDto,
      {
        firstName: applicantDto.firstName!,
        lastName: applicantDto.lastName ?? null,
        email: applicantDto.email ?? null,
        phone: applicantDto.phone ?? null,
        imageKey,
        currentPosition: applicantDetails.currentPosition,
        linkedin: applicantDetails.linkedin ?? null,
        portfolio: applicantDetails.portfolio ?? null,
        hardSkills,
        softSkills: softSkills.slice(0, 20),
        cityName: city.name,
        countryName: city.countryName,
        description: applicantDetails.description,
        professionName: profession.title,
        specialties: _.map(specialties.data, 'title'),
        level,
        employmentTypes,
        englishLevel,
        salary: applicantDetails.salary,
      },
    );

    const command = new InvokeCommand({
      FunctionName: this.configService.resumeGenerateConfig.lambdaFunctionName,
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: new TextEncoder().encode(JSON.stringify(applicantResumeDto)),
    });

    const invocationResponse = await this.lambdaClient.send(command);

    const key = new TextDecoder()
      .decode(invocationResponse.Payload)
      .replaceAll(/^"|"$/g, '');

    return UtilsProvider.plainToInstance(ResumeKeyPayloadDto, {
      key,
    });
  }

  async getSignedUrl(getSignedUrlDto: GetSignedUrlDto): Promise<SignedUrlDto> {
    const getSignedUrlCommand = new GetObjectCommand({
      Bucket: this.configService.awsS3Config.bucketName,
      Key: getSignedUrlDto.key,
      ResponseContentDisposition: `attachment; filename=${getSignedUrlDto.name}`,
    });

    const url = await getSignedUrl(this.s3Client, getSignedUrlCommand, {
      expiresIn: 3600,
    });

    return SignedUrlDto.create({
      url,
    });
  }
}
