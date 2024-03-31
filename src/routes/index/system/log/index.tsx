import type { ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Modal, Popover, Tag } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'

import { client } from '@/api'
import type {
  log__findManyResponseData_data,
  user__findUniqueResponseData_data
} from '@/api/models'
import { replaceAntSearchFormValues } from '@/utils'

enum METHODTYPE {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

const LogPage = () => {
  const columns: ProColumns<log__findManyResponseData_data>[] = [
    // {
    //   title: 'id',
    //   dataIndex: 'id',
    //   search: false
    // },
    {
      title: '时间',
      dataIndex: 'createdAt',
      search: false,
      // sorter: true,
      // sortDirections: ['asc', 'desc'] as any, // 使用sortDirections时排序按钮会消失，antd bug
      render: (_, record) => <div>{dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
    },
    {
      title: 'error',
      dataIndex: 'error',
      search: false,
      render: (_, record) => (
        <>
          {record.error ? (
            <Popover content={record.error} title="error" overlayInnerStyle={{ width: '300px' }}>
              <Tag color={'volcano'}>Error</Tag>
            </Popover>
          ) : (
            <div>-</div>
          )}
        </>
      )
    },
    {
      title: 'ip',
      dataIndex: 'ip'
    },
    {
      title: 'method',
      dataIndex: 'method',
      valueEnum: METHODTYPE
    },
    {
      title: 'path',
      dataIndex: 'path',
      ellipsis: true
    },
    {
      title: 'body',
      dataIndex: 'body',
      width: 280,
      search: false,
      ellipsis: true
    },
    {
      title: 'userId',
      dataIndex: 'userId',
      search: false,
      width: 200,
      render: (_, record) => (
        <div
          className="cursor-pointer c-blue truncate"
          onClick={() => onClickUserId(record.userId ?? '')}
        >
          {record.userId}
        </div>
      )
    },
    {
      title: '耗时（s）',
      dataIndex: 'cost',
      search: false
      // sorter: (a, b) => a!.cost! - b!.cost!
    },
    {
      title: 'requestId',
      dataIndex: 'requestId',
      search: false,
      ellipsis: true
    },
    {
      title: '状态码',
      dataIndex: 'status',
      search: false
    },
    {
      title: '浏览器 UA',
      dataIndex: 'ua',
      search: false,
      ellipsis: true
    }
  ]

  const [userInfo, setUserInfo] = useState<user__findUniqueResponseData_data>()
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false)

  const onClickUserId = async (userId: string) => {
    const { error, data } = await client.query({
      operationName: 'user/findUnique',
      input: {
        userId
      }
    })
    if (!error) {
      console.log(data)
      setUserInfo(data?.data)
      setIsUserInfoModalOpen(true)
    }
  }

  const handleUserInfoOk = () => {
    setIsUserInfoModalOpen(false)
  }

  return (
    <>
      <ProTable
        columns={columns}
        rowKey="id"
        bordered
        scroll={{ x: 2000 }}
        request={async (params, sort, filter) => {
          console.log('params===', params, sort, filter)
          const { error, data } = await client.query({
            operationName: 'log/findMany',
            input: {
              skip: (params!.current! - 1) * params.pageSize!,
              take: params.pageSize,
              // orderBy: [sort],
              ...replaceAntSearchFormValues(params)
            }
          })
          return {
            total: error ? 0 : data!.total,
            data: error ? [] : data!.data!,
            success: true
          }
        }}
      />
      <Modal
        title="UserInfo"
        open={isUserInfoModalOpen}
        onOk={handleUserInfoOk}
        onCancel={() => setIsUserInfoModalOpen(false)}
      >
        {
          // @ts-ignore
          userInfo &&
            Object.keys(userInfo as Object).map(item => (
              <p key={item}>
                {item} : {userInfo[item]}
              </p>
            ))
        }
      </Modal>
    </>
  )
}

export default LogPage
