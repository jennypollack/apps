import { BadRequestException, Controller, Get, NotFoundException, Param, Req } from '@nestjs/common'
import { AgreementRepo } from '../repos/agreement.repo'
import { UserRepo } from '../repos/user.repo'
import { DocusignService } from '../services/docusign.service'
import { PoolService } from '../services/pool.service'
import { SessionCookieName, SessionService } from '../services/session.service'

@Controller()
export class AgreementController {
  constructor(
    private readonly agreementRepo: AgreementRepo,
    private readonly docusignService: DocusignService,
    private readonly userRepo: UserRepo,
    private readonly poolService: PoolService,
    private readonly sessionService: SessionService
  ) {}

  // TODO: this should probably only be returned after verifying address ownership
  @Get('pools/:poolId/agreements/:agreementId/link')
  async getAgreementLink(@Param() params, @Req() req): Promise<string> {
    const agreement = await this.agreementRepo.find(params.agreementId)
    if (!agreement) throw new NotFoundException(`Agreement ${params.agreementId} not found`)

    const user = await this.userRepo.find(agreement.userId)
    if (!user) throw new BadRequestException('User for this agreement does not exist')

    console.log(req.cookies)
    this.sessionService.verify(req.cookies[SessionCookieName], user.id)

    const pool = await this.poolService.get(params.poolId)
    if (!pool) throw new BadRequestException('Invalid pool')

    const returnUrl = `${process.env.TINLAKE_UI_HOST}pool/${params.poolId}/${pool.metadata.slug}?onb=1`
    return this.docusignService.getAgreementLink(agreement.providerEnvelopeId, user, returnUrl)
  }
}
