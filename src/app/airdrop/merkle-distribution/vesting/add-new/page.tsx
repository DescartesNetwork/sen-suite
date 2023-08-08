import InputConfig from './inputConfig'

export enum CreateStep {
  InputConfigs,
  InputRecipients,
  Confirm,
}

const NewVesting = () => {
  return (
    <div className="flex flex-col gap-6 ">
      <h5>Add new Vesting</h5>
      <div className="card bg-base-100 p-6 ">
        <InputConfig />
      </div>
    </div>
  )
}

export default NewVesting
