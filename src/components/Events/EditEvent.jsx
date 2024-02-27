import { Link, redirect, useNavigate, useParams, useSubmit, useNavigation } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {useQuery } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const{id} =  useParams()
  const navigate = useNavigate();
  const submit = useSubmit()
  const { state} = useNavigation()

 const{data, isError, error} = useQuery({
    queryKey : ['events', id],
    queryFn: ({signal})=>  fetchEvent({signal, id}),
    staleTime: 10000
  })

//  const{mutate} = useMutation({
//   mutationFn: updateEvent,
//   onMutate: async (data)=> {
//     const newEvent = data.event

//     await queryClient.cancelQueries({queryKey: ['events', id] })
//     const previousEvent = queryClient.getQueryData(['events',id]);

//     queryClient.setQueryData(['events', id], newEvent)

//     return { previousEvent };
//   },
//   onError: (error, data, context) => {
//     queryClient.setQueryData(['events', id], context.previousEvent);
//   },
//   onSettled: () => {
//     queryClient.invalidateQueries(['events', id]);
//   }
  
//   })

  function handleSubmit(formData) {
    submit(formData, {method: 'PUT'}, )
  }

  function handleClose() {
    navigate('../');
  }


  let content;


  if(isError) {
    content =
    <>
     <ErrorBlock
     title="Failed to update event" 
     message={error.info?.message ||
          'failed to update event. Please try again later'}/>
    <div className='form-actions'>
      <Link to='../' className='button'>Okay</Link></div></>
  }


  if(data){
    
  content = (    <EventForm inputData={data} onSubmit={handleSubmit}>
    {state === 'submitting' ? <p>Sending data...</p> : <>
      <Link to="../" className="button-text">
      Cancel
    </Link>
    <button type="submit" className="button">
      Update
    </button>
    </>}
        
       
      </EventForm>
    

 ) }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}


export function loader({ params}){
  return  queryClient.fetchQuery({
    queryKey : ['events', params.id],
    queryFn: ({signal})=>  fetchEvent({signal, id:params.id})
  })

}

export async function action({request, params}) {
        const formData = await request.formData()
        const updatedEventData = Object.fromEntries(formData)
       await updateEvent({id: params.id, event: updatedEventData})
       await queryClient.invalidateQueries(['events'])
       return redirect('../')
}

